#!/bin/bash

# Flink Auto-Scaler Deployment Script
# This script helps deploy and manage the Flink auto-scaler on Kubernetes

set -e

# Configuration
NAMESPACE="default"
IMAGE_NAME="flink-autoscaler"
IMAGE_TAG="latest"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

show_help() {
    cat << EOF
Flink Auto-Scaler Deployment Script

Usage: $0 [COMMAND] [OPTIONS]

Commands:
  deploy      Deploy the complete Flink cluster with auto-scaler
  build       Build the auto-scaler Docker image
  update      Update the auto-scaler configuration
  logs        Show auto-scaler logs
  status      Show cluster status
  clean       Remove all components
  help        Show this help message

Options:
  -n, --namespace NAMESPACE    Kubernetes namespace (default: default)
  -i, --image IMAGE           Docker image name (default: flink-autoscaler)
  -t, --tag TAG              Docker image tag (default: latest)

Examples:
  $0 deploy                    # Deploy everything with defaults
  $0 deploy -n flink-prod      # Deploy to flink-prod namespace
  $0 build -t v1.0.0          # Build image with tag v1.0.0
  $0 logs                      # Show auto-scaler logs
  $0 status                    # Show cluster status

EOF
}

check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check if kubectl is installed
    if ! command -v kubectl &> /dev/null; then
        log_error "kubectl is not installed or not in PATH"
        exit 1
    fi
    
    # Check if connected to cluster
    if ! kubectl cluster-info &> /dev/null; then
        log_error "Not connected to a Kubernetes cluster"
        exit 1
    fi
    
    # Check if Docker is available for build command
    if [[ "$1" == "build" ]] && ! command -v docker &> /dev/null; then
        log_error "Docker is not installed or not in PATH"
        exit 1
    fi
    
    log_info "Prerequisites check passed"
}

build_image() {
    log_info "Building Docker image: ${IMAGE_NAME}:${IMAGE_TAG}"
    
    docker build -t "${IMAGE_NAME}:${IMAGE_TAG}" .
    
    log_info "Docker image built successfully"
    log_info "To push to registry: docker push ${IMAGE_NAME}:${IMAGE_TAG}"
}

create_namespace() {
    if ! kubectl get namespace "$NAMESPACE" &> /dev/null; then
        log_info "Creating namespace: $NAMESPACE"
        kubectl create namespace "$NAMESPACE"
    else
        log_info "Namespace $NAMESPACE already exists"
    fi
}

deploy_configmaps() {
    log_info "Creating ConfigMaps..."
    
    # Create autoscaler config
    kubectl create configmap autoscaler-config \
        --from-file=autoscaler-config.yaml \
        --namespace="$NAMESPACE" \
        --dry-run=client -o yaml | kubectl apply -f -
    
    # Create autoscaler code
    kubectl create configmap autoscaler-code \
        --from-file=flink_autoscaler.py \
        --namespace="$NAMESPACE" \
        --dry-run=client -o yaml | kubectl apply -f -
    
    log_info "ConfigMaps created successfully"
}

deploy_cluster() {
    log_info "Deploying Flink cluster and auto-scaler..."
    
    # Update namespace in YAML if different from default
    if [[ "$NAMESPACE" != "default" ]]; then
        sed "s/namespace: default/namespace: $NAMESPACE/g" k8s-flink-cluster.yaml > k8s-flink-cluster-temp.yaml
        kubectl apply -f k8s-flink-cluster-temp.yaml
        rm k8s-flink-cluster-temp.yaml
    else
        kubectl apply -f k8s-flink-cluster.yaml
    fi
    
    log_info "Cluster deployment completed"
}

deploy_all() {
    log_info "Starting complete deployment..."
    
    create_namespace
    deploy_configmaps
    deploy_cluster
    
    log_info "Waiting for deployments to be ready..."
    kubectl wait --for=condition=available deployment/flink-jobmanager --namespace="$NAMESPACE" --timeout=300s
    kubectl wait --for=condition=available deployment/flink-taskmanager --namespace="$NAMESPACE" --timeout=300s
    kubectl wait --for=condition=available deployment/flink-autoscaler --namespace="$NAMESPACE" --timeout=300s
    
    log_info "Deployment completed successfully!"
    log_info ""
    log_info "Access Flink Web UI:"
    log_info "  kubectl port-forward svc/flink-jobmanager-rest 8081:8081 --namespace=$NAMESPACE"
    log_info "  Then open: http://localhost:8081"
}

update_config() {
    log_info "Updating auto-scaler configuration..."
    
    deploy_configmaps
    
    # Restart auto-scaler to pick up new config
    kubectl rollout restart deployment/flink-autoscaler --namespace="$NAMESPACE"
    
    log_info "Configuration updated successfully"
}

show_logs() {
    log_info "Showing auto-scaler logs..."
    kubectl logs -f deployment/flink-autoscaler --namespace="$NAMESPACE"
}

show_status() {
    log_info "Cluster Status:"
    echo ""
    
    log_info "Pods:"
    kubectl get pods --namespace="$NAMESPACE" -l app=flink -o wide
    echo ""
    
    log_info "Services:"
    kubectl get services --namespace="$NAMESPACE" -l app=flink
    echo ""
    
    log_info "Deployments:"
    kubectl get deployments --namespace="$NAMESPACE"
    echo ""
    
    log_info "Auto-scaler logs (last 10 lines):"
    kubectl logs deployment/flink-autoscaler --namespace="$NAMESPACE" --tail=10
}

clean_all() {
    log_warn "This will remove all Flink components from namespace: $NAMESPACE"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log_info "Removing all components..."
        
        kubectl delete -f k8s-flink-cluster.yaml --namespace="$NAMESPACE" --ignore-not-found=true
        kubectl delete configmap autoscaler-config --namespace="$NAMESPACE" --ignore-not-found=true
        kubectl delete configmap autoscaler-code --namespace="$NAMESPACE" --ignore-not-found=true
        
        log_info "Cleanup completed"
    else
        log_info "Cleanup cancelled"
    fi
}

# Parse command line arguments
COMMAND=""
while [[ $# -gt 0 ]]; do
    case $1 in
        deploy|build|update|logs|status|clean|help)
            COMMAND="$1"
            shift
            ;;
        -n|--namespace)
            NAMESPACE="$2"
            shift 2
            ;;
        -i|--image)
            IMAGE_NAME="$2"
            shift 2
            ;;
        -t|--tag)
            IMAGE_TAG="$2"
            shift 2
            ;;
        *)
            log_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Main execution
case $COMMAND in
    deploy)
        check_prerequisites
        deploy_all
        ;;
    build)
        check_prerequisites build
        build_image
        ;;
    update)
        check_prerequisites
        update_config
        ;;
    logs)
        check_prerequisites
        show_logs
        ;;
    status)
        check_prerequisites
        show_status
        ;;
    clean)
        check_prerequisites
        clean_all
        ;;
    help|"")
        show_help
        ;;
    *)
        log_error "Unknown command: $COMMAND"
        show_help
        exit 1
        ;;
esac 