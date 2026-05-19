#!/usr/bin/env python3
"""
Apache Flink Auto-Scaler
Monitors Flink cluster metrics and automatically scales TaskManagers based on defined policies.
"""

import time
import json
import logging
import requests
from dataclasses import dataclass
from typing import Dict, List, Optional
from datetime import datetime, timedelta
import threading
from kubernetes import client, config
import yaml

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@dataclass
class ScalingPolicy:
    """Configuration for auto-scaling policies"""
    # CPU thresholds
    cpu_scale_up_threshold: float = 80.0      # Scale up when CPU > 80%
    cpu_scale_down_threshold: float = 30.0    # Scale down when CPU < 30%
    
    # Memory thresholds
    memory_scale_up_threshold: float = 85.0   # Scale up when memory > 85%
    memory_scale_down_threshold: float = 40.0 # Scale down when memory < 40%
    
    # Backpressure thresholds
    backpressure_threshold: float = 0.8       # Scale up when backpressure > 80%
    
    # Task queue thresholds
    pending_tasks_threshold: int = 100        # Scale up when pending tasks > 100
    
    # Scaling limits
    min_task_managers: int = 2
    max_task_managers: int = 20
    
    # Timing controls
    scale_up_cooldown: int = 300              # 5 minutes
    scale_down_cooldown: int = 600            # 10 minutes
    evaluation_interval: int = 60             # 1 minute
    
    # Stability requirements
    stable_period_for_scale_down: int = 600   # 10 minutes of stable metrics before scale down

@dataclass
class FlinkMetrics:
    """Flink cluster metrics"""
    cpu_usage: float
    memory_usage: float
    backpressure_ratio: float
    pending_tasks: int
    running_tasks: int
    task_managers_count: int
    available_slots: int
    total_slots: int
    timestamp: datetime

class FlinkMetricsCollector:
    """Collects metrics from Flink JobManager REST API"""
    
    def __init__(self, jobmanager_url: str):
        self.jobmanager_url = jobmanager_url.rstrip('/')
        self.session = requests.Session()
        
    def get_cluster_overview(self) -> Dict:
        """Get cluster overview from Flink REST API"""
        try:
            response = self.session.get(f"{self.jobmanager_url}/overview")
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Failed to get cluster overview: {e}")
            return {}
    
    def get_taskmanagers(self) -> List[Dict]:
        """Get TaskManager information"""
        try:
            response = self.session.get(f"{self.jobmanager_url}/taskmanagers")
            response.raise_for_status()
            return response.json().get('taskmanagers', [])
        except Exception as e:
            logger.error(f"Failed to get TaskManagers: {e}")
            return []
    
    def get_jobs(self) -> List[Dict]:
        """Get running jobs information"""
        try:
            response = self.session.get(f"{self.jobmanager_url}/jobs")
            response.raise_for_status()
            return response.json().get('jobs', [])
        except Exception as e:
            logger.error(f"Failed to get jobs: {e}")
            return []
    
    def get_job_metrics(self, job_id: str) -> Dict:
        """Get metrics for a specific job"""
        try:
            response = self.session.get(f"{self.jobmanager_url}/jobs/{job_id}")
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Failed to get job {job_id} metrics: {e}")
            return {}
    
    def collect_metrics(self) -> Optional[FlinkMetrics]:
        """Collect comprehensive Flink cluster metrics"""
        try:
            # Get cluster overview
            overview = self.get_cluster_overview()
            if not overview:
                return None
            
            # Get TaskManager information
            taskmanagers = self.get_taskmanagers()
            
            # Calculate CPU and memory usage
            total_cpu = 0
            total_memory_used = 0
            total_memory_available = 0
            
            for tm in taskmanagers:
                # CPU usage (assuming it's available in metrics)
                total_cpu += tm.get('hardware', {}).get('cpuCores', 0)
                
                # Memory usage
                memory = tm.get('hardware', {}).get('physicalMemory', 0)
                heap_used = tm.get('metrics', {}).get('heapUsed', 0)
                total_memory_used += heap_used
                total_memory_available += memory
            
            cpu_usage = (total_cpu / len(taskmanagers)) * 100 if taskmanagers else 0
            memory_usage = (total_memory_used / total_memory_available) * 100 if total_memory_available > 0 else 0
            
            # Get job information for backpressure and task counts
            jobs = self.get_jobs()
            total_pending_tasks = 0
            total_running_tasks = 0
            backpressure_ratio = 0
            
            for job in jobs:
                if job.get('status') == 'RUNNING':
                    job_details = self.get_job_metrics(job['jid'])
                    vertices = job_details.get('vertices', [])
                    
                    for vertex in vertices:
                        total_running_tasks += vertex.get('parallelism', 0)
                        # Backpressure estimation (simplified)
                        if vertex.get('metrics', {}).get('write-buffers-inPoolUsage', 0) > 0.8:
                            backpressure_ratio += 0.1
            
            return FlinkMetrics(
                cpu_usage=cpu_usage,
                memory_usage=memory_usage,
                backpressure_ratio=min(backpressure_ratio, 1.0),
                pending_tasks=total_pending_tasks,
                running_tasks=total_running_tasks,
                task_managers_count=len(taskmanagers),
                available_slots=overview.get('slots-available', 0),
                total_slots=overview.get('slots-total', 0),
                timestamp=datetime.now()
            )
            
        except Exception as e:
            logger.error(f"Failed to collect metrics: {e}")
            return None

class KubernetesScaler:
    """Handles scaling operations on Kubernetes"""
    
    def __init__(self, namespace: str = "default", deployment_name: str = "flink-taskmanager"):
        self.namespace = namespace
        self.deployment_name = deployment_name
        
        # Load Kubernetes config
        try:
            config.load_incluster_config()  # For running inside cluster
        except:
            config.load_kube_config()  # For running outside cluster
            
        self.apps_v1 = client.AppsV1Api()
    
    def get_current_replicas(self) -> int:
        """Get current number of TaskManager replicas"""
        try:
            deployment = self.apps_v1.read_namespaced_deployment(
                name=self.deployment_name,
                namespace=self.namespace
            )
            return deployment.spec.replicas
        except Exception as e:
            logger.error(f"Failed to get current replicas: {e}")
            return 0
    
    def scale_deployment(self, replicas: int) -> bool:
        """Scale the TaskManager deployment"""
        try:
            # Patch the deployment
            body = {'spec': {'replicas': replicas}}
            self.apps_v1.patch_namespaced_deployment(
                name=self.deployment_name,
                namespace=self.namespace,
                body=body
            )
            logger.info(f"Scaled TaskManager deployment to {replicas} replicas")
            return True
        except Exception as e:
            logger.error(f"Failed to scale deployment: {e}")
            return False

class FlinkAutoScaler:
    """Main auto-scaling controller"""
    
    def __init__(self, 
                 jobmanager_url: str,
                 policy: ScalingPolicy,
                 kubernetes_namespace: str = "default",
                 taskmanager_deployment: str = "flink-taskmanager"):
        
        self.policy = policy
        self.metrics_collector = FlinkMetricsCollector(jobmanager_url)
        self.k8s_scaler = KubernetesScaler(kubernetes_namespace, taskmanager_deployment)
        
        # Scaling state
        self.last_scale_up_time = datetime.min
        self.last_scale_down_time = datetime.min
        self.metrics_history: List[FlinkMetrics] = []
        self.running = False
        
    def should_scale_up(self, metrics: FlinkMetrics) -> bool:
        """Determine if cluster should be scaled up"""
        # Check cooldown period
        if datetime.now() - self.last_scale_up_time < timedelta(seconds=self.policy.scale_up_cooldown):
            return False
        
        # Check if at maximum capacity
        if metrics.task_managers_count >= self.policy.max_task_managers:
            return False
        
        # Check scaling triggers
        triggers = [
            metrics.cpu_usage > self.policy.cpu_scale_up_threshold,
            metrics.memory_usage > self.policy.memory_scale_up_threshold,
            metrics.backpressure_ratio > self.policy.backpressure_threshold,
            metrics.pending_tasks > self.policy.pending_tasks_threshold,
            metrics.available_slots < 1  # No available slots
        ]
        
        return any(triggers)
    
    def should_scale_down(self, metrics: FlinkMetrics) -> bool:
        """Determine if cluster should be scaled down"""
        # Check cooldown period
        if datetime.now() - self.last_scale_down_time < timedelta(seconds=self.policy.scale_down_cooldown):
            return False
        
        # Check if at minimum capacity
        if metrics.task_managers_count <= self.policy.min_task_managers:
            return False
        
        # Check if metrics have been stable for the required period
        stable_period = timedelta(seconds=self.policy.stable_period_for_scale_down)
        recent_metrics = [m for m in self.metrics_history 
                         if datetime.now() - m.timestamp < stable_period]
        
        if len(recent_metrics) < 3:  # Need at least 3 data points
            return False
        
        # All recent metrics should indicate low resource usage
        all_low_usage = all([
            m.cpu_usage < self.policy.cpu_scale_down_threshold and
            m.memory_usage < self.policy.memory_scale_down_threshold and
            m.backpressure_ratio < 0.2 and
            m.pending_tasks == 0
            for m in recent_metrics
        ])
        
        # Check if we have sufficient spare capacity
        spare_slots_ratio = (metrics.available_slots / metrics.total_slots) if metrics.total_slots > 0 else 0
        sufficient_spare_capacity = spare_slots_ratio > 0.5
        
        return all_low_usage and sufficient_spare_capacity
    
    def execute_scaling_decision(self, metrics: FlinkMetrics):
        """Execute scaling decision based on current metrics"""
        current_replicas = metrics.task_managers_count
        
        if self.should_scale_up(metrics):
            new_replicas = min(current_replicas + 1, self.policy.max_task_managers)
            logger.info(f"Scaling UP: {current_replicas} -> {new_replicas}")
            logger.info(f"Trigger: CPU={metrics.cpu_usage:.1f}%, Memory={metrics.memory_usage:.1f}%, "
                       f"Backpressure={metrics.backpressure_ratio:.2f}, Pending={metrics.pending_tasks}")
            
            if self.k8s_scaler.scale_deployment(new_replicas):
                self.last_scale_up_time = datetime.now()
                
        elif self.should_scale_down(metrics):
            new_replicas = max(current_replicas - 1, self.policy.min_task_managers)
            logger.info(f"Scaling DOWN: {current_replicas} -> {new_replicas}")
            logger.info(f"Trigger: CPU={metrics.cpu_usage:.1f}%, Memory={metrics.memory_usage:.1f}%, "
                       f"Available slots ratio={(metrics.available_slots/metrics.total_slots)*100:.1f}%")
            
            if self.k8s_scaler.scale_deployment(new_replicas):
                self.last_scale_down_time = datetime.now()
    
    def cleanup_old_metrics(self):
        """Remove old metrics from history"""
        cutoff_time = datetime.now() - timedelta(hours=1)
        self.metrics_history = [m for m in self.metrics_history if m.timestamp > cutoff_time]
    
    def run_scaling_loop(self):
        """Main scaling loop"""
        logger.info("Starting Flink Auto-Scaler")
        self.running = True
        
        while self.running:
            try:
                # Collect metrics
                metrics = self.metrics_collector.collect_metrics()
                if metrics is None:
                    logger.warning("Failed to collect metrics, skipping scaling decision")
                    time.sleep(self.policy.evaluation_interval)
                    continue
                
                # Store metrics for history
                self.metrics_history.append(metrics)
                self.cleanup_old_metrics()
                
                # Log current status
                logger.info(f"Metrics - TMs: {metrics.task_managers_count}, "
                           f"CPU: {metrics.cpu_usage:.1f}%, Memory: {metrics.memory_usage:.1f}%, "
                           f"Backpressure: {metrics.backpressure_ratio:.2f}, "
                           f"Slots: {metrics.available_slots}/{metrics.total_slots}")
                
                # Make scaling decision
                self.execute_scaling_decision(metrics)
                
                # Wait for next evaluation
                time.sleep(self.policy.evaluation_interval)
                
            except KeyboardInterrupt:
                logger.info("Received interrupt signal, stopping auto-scaler")
                break
            except Exception as e:
                logger.error(f"Error in scaling loop: {e}")
                time.sleep(self.policy.evaluation_interval)
        
        self.running = False
        logger.info("Flink Auto-Scaler stopped")
    
    def start(self):
        """Start the auto-scaler in a separate thread"""
        self.scaling_thread = threading.Thread(target=self.run_scaling_loop)
        self.scaling_thread.daemon = True
        self.scaling_thread.start()
        return self.scaling_thread
    
    def stop(self):
        """Stop the auto-scaler"""
        self.running = False
        if hasattr(self, 'scaling_thread'):
            self.scaling_thread.join()

def create_default_config() -> Dict:
    """Create default configuration"""
    return {
        'flink': {
            'jobmanager_url': 'http://flink-jobmanager:8081'
        },
        'kubernetes': {
            'namespace': 'default',
            'taskmanager_deployment': 'flink-taskmanager'
        },
        'scaling_policy': {
            'cpu_scale_up_threshold': 80.0,
            'cpu_scale_down_threshold': 30.0,
            'memory_scale_up_threshold': 85.0,
            'memory_scale_down_threshold': 40.0,
            'backpressure_threshold': 0.8,
            'pending_tasks_threshold': 100,
            'min_task_managers': 2,
            'max_task_managers': 20,
            'scale_up_cooldown': 300,
            'scale_down_cooldown': 600,
            'evaluation_interval': 60,
            'stable_period_for_scale_down': 600
        }
    }

def main():
    """Main entry point"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Flink Auto-Scaler')
    parser.add_argument('--config', '-c', help='Configuration file path')
    parser.add_argument('--jobmanager-url', help='Flink JobManager URL')
    parser.add_argument('--namespace', help='Kubernetes namespace')
    parser.add_argument('--dry-run', action='store_true', help='Run in dry-run mode (no actual scaling)')
    
    args = parser.parse_args()
    
    # Load configuration
    if args.config:
        with open(args.config, 'r') as f:
            config_data = yaml.safe_load(f)
    else:
        config_data = create_default_config()
    
    # Override with command line arguments
    if args.jobmanager_url:
        config_data['flink']['jobmanager_url'] = args.jobmanager_url
    if args.namespace:
        config_data['kubernetes']['namespace'] = args.namespace
    
    # Create scaling policy
    policy = ScalingPolicy(**config_data['scaling_policy'])
    
    # Create and start auto-scaler
    autoscaler = FlinkAutoScaler(
        jobmanager_url=config_data['flink']['jobmanager_url'],
        policy=policy,
        kubernetes_namespace=config_data['kubernetes']['namespace'],
        taskmanager_deployment=config_data['kubernetes']['taskmanager_deployment']
    )
    
    if args.dry_run:
        logger.info("Running in DRY-RUN mode - no actual scaling will occur")
        # Override scaling methods for dry-run
        original_scale = autoscaler.k8s_scaler.scale_deployment
        def dry_run_scale(replicas):
            logger.info(f"DRY-RUN: Would scale to {replicas} replicas")
            return True
        autoscaler.k8s_scaler.scale_deployment = dry_run_scale
    
    try:
        autoscaler.run_scaling_loop()
    except KeyboardInterrupt:
        logger.info("Shutting down auto-scaler")
        autoscaler.stop()

if __name__ == "__main__":
    main() 