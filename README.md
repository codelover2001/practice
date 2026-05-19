# Flink Auto-Scaler

A comprehensive auto-scaling solution for Apache Flink clusters running on Kubernetes. This solution monitors Flink cluster metrics and automatically scales TaskManager instances based on configurable policies.

## Features

- **Real-time Metrics Monitoring**: Monitors CPU usage, memory consumption, backpressure, and task queue metrics
- **Intelligent Scaling Logic**: Implements smart scaling decisions with cooldown periods and stability requirements
- **Kubernetes Integration**: Seamlessly scales Flink TaskManager deployments on Kubernetes
- **Configurable Policies**: Fully customizable scaling thresholds and timing parameters
- **Production Ready**: Includes proper error handling, logging, and dry-run mode
- **Multi-metric Analysis**: Makes scaling decisions based on multiple metrics for better accuracy

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  Flink Cluster  │◄──►│  Auto-Scaler     │◄──►│  Kubernetes API │
│  (REST API)     │    │  (Metrics &      │    │  (Scaling)      │
│                 │    │   Decisions)     │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Quick Start

### 1. Prerequisites

- Kubernetes cluster with RBAC enabled
- Apache Flink cluster deployed on Kubernetes
- Python 3.8+ (if running locally)

### 2. Deploy Flink Cluster

Deploy the complete Flink cluster with auto-scaler:

```bash
# Deploy the Flink cluster and auto-scaler
kubectl apply -f k8s-flink-cluster.yaml

# Create config maps for the auto-scaler
kubectl create configmap autoscaler-config --from-file=autoscaler-config.yaml
kubectl create configmap autoscaler-code --from-file=flink_autoscaler.py
```

### 3. Install Dependencies (for local development)

```bash
pip install -r requirements.txt
```

### 4. Run Auto-Scaler

#### Option A: Run in Kubernetes (Recommended)
The auto-scaler is included in the deployment YAML and will run automatically.

#### Option B: Run Locally
```bash
# Run with default configuration
python flink_autoscaler.py --jobmanager-url http://localhost:8081

# Run with custom configuration
python flink_autoscaler.py --config autoscaler-config.yaml

# Run in dry-run mode (no actual scaling)
python flink_autoscaler.py --dry-run --jobmanager-url http://localhost:8081
```

## Configuration

The auto-scaler is configured via YAML files. See `autoscaler-config.yaml` for a complete example:

```yaml
flink:
  jobmanager_url: "http://flink-jobmanager:8081"

kubernetes:
  namespace: "default"
  taskmanager_deployment: "flink-taskmanager"

scaling_policy:
  # CPU thresholds (percentage)
  cpu_scale_up_threshold: 80.0
  cpu_scale_down_threshold: 30.0
  
  # Memory thresholds (percentage)
  memory_scale_up_threshold: 85.0
  memory_scale_down_threshold: 40.0
  
  # Scaling limits
  min_task_managers: 2
  max_task_managers: 20
  
  # Timing controls (seconds)
  scale_up_cooldown: 300      # 5 minutes
  scale_down_cooldown: 600    # 10 minutes
  evaluation_interval: 60     # 1 minute
```

### Scaling Triggers

The auto-scaler will **scale UP** when any of these conditions are met:
- CPU usage > `cpu_scale_up_threshold`
- Memory usage > `memory_scale_up_threshold`
- Backpressure ratio > `backpressure_threshold`
- Pending tasks > `pending_tasks_threshold`
- Available task slots < 1

The auto-scaler will **scale DOWN** when ALL of these conditions are met:
- CPU usage < `cpu_scale_down_threshold`
- Memory usage < `memory_scale_down_threshold`
- Backpressure ratio < 0.2
- No pending tasks
- Sufficient spare capacity (>50% available slots)
- Metrics have been stable for the configured period

## Monitoring and Logging

The auto-scaler provides comprehensive logging:

```
2023-12-07 10:30:15,123 - __main__ - INFO - Starting Flink Auto-Scaler
2023-12-07 10:30:16,234 - __main__ - INFO - Metrics - TMs: 3, CPU: 45.2%, Memory: 67.8%, Backpressure: 0.12, Slots: 2/6
2023-12-07 10:31:15,345 - __main__ - INFO - Scaling UP: 3 -> 4
2023-12-07 10:31:15,346 - __main__ - INFO - Trigger: CPU=85.4%, Memory=72.1%, Backpressure=0.23, Pending=0
```

## Advanced Usage

### Custom Metrics Integration

You can extend the `FlinkMetricsCollector` class to integrate with custom monitoring systems:

```python
class CustomMetricsCollector(FlinkMetricsCollector):
    def collect_metrics(self) -> Optional[FlinkMetrics]:
        # Get base metrics from Flink
        metrics = super().collect_metrics()
        
        # Add custom metrics from your monitoring system
        custom_cpu = get_cpu_from_prometheus()
        if custom_cpu is not None:
            metrics.cpu_usage = custom_cpu
            
        return metrics
```

### Integration with Prometheus

For production deployments, consider integrating with Prometheus for more accurate metrics:

```python
from prometheus_client.parser import text_string_to_metric_families
import requests

def get_prometheus_metrics(query: str) -> float:
    response = requests.get(f'http://prometheus:9090/api/v1/query?query={query}')
    data = response.json()
    return float(data['data']['result'][0]['value'][1])
```

## Troubleshooting

### Common Issues

1. **Auto-scaler not starting**
   - Check Kubernetes RBAC permissions
   - Verify JobManager URL is accessible
   - Check logs: `kubectl logs deployment/flink-autoscaler`

2. **Scaling not working**
   - Verify deployment name matches configuration
   - Check cooldown periods
   - Ensure metrics are being collected properly

3. **Metrics collection failing**
   - Verify Flink REST API is accessible
   - Check Flink cluster health
   - Review auto-scaler logs

### Debug Mode

Enable debug logging for detailed troubleshooting:

```python
logging.basicConfig(level=logging.DEBUG)
```

## Performance Considerations

- **Evaluation Interval**: Balance between responsiveness and system load (default: 60 seconds)
- **Cooldown Periods**: Prevent thrashing while allowing quick response to load changes
- **Stability Period**: Ensure metrics are stable before scaling down to avoid oscillation

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues and questions:
- Check the troubleshooting section
- Review the logs for error messages
- Create an issue with detailed information about your setup 