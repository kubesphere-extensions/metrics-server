## Functionality

Metrics Server is a scalable, efficient source of container resource metrics for Kubernetes
built-in autoscaling pipelines.

Metrics Server collects resource metrics from Kubelets and exposes them in Kubernetes apiserver through [Metrics API](https://github.com/kubernetes/metrics)
for use by [Horizontal Pod Autoscaler](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/) and [Vertical Pod Autoscaler](https://github.com/kubernetes/autoscaler/tree/master/vertical-pod-autoscaler/). Metrics API can also be accessed by `kubectl top`,
making it easier to debug autoscaling pipelines.

Metrics Server is not meant for non-autoscaling purposes. For example, don't use it to forward metrics to monitoring solutions, or as a source of monitoring solution metrics. In such cases please collect metrics from Kubelet `/metrics/resource` endpoint directly.

## Quick Start

After installation, click on a workload of the cluster or project to enter the details page of the Deployment or StatefulSet, you can create **Pod Horizontal Auto Scaling**.

After settings, the system will automatically adjust the number of pod replicas for the workload based on the target CPU and memory usage you set.


## Upgrade

**⚠️ Attention**

Before extension upgrades, rigorously verify that image tag configurations meets expectations. New releases typically employ updated image tags; explicit retention of legacy tags in configurations may result in persistent deployment of obsolete versions, thereby preventing acquisition of critical enhancements or fixes.

To ensure seamless upgrades, please follow these recommendations:

1. **Check and remove manually specified image tags**, or synchronize them with version-specific tags required by the update.
2. **Default configurations are strongly recommended** to autonomously procure current release-aligned image tags and settings.

The following YAML paths govern image tag configurations within this extension:

```yaml
metrics-server:
  image:
    registry: docker.io
    repository: kubesphere/metrics-server
    # tag: "v0.7.2"

frontend:
  image:
    registry: docker.io
    repository: kubesphere/metrics-server-frontend
    # tag: "v1.0.0"  

ks-autoscaling-controller:
  image:
    registry: docker.io
    repository: kubesphere/ks-autoscaling-controller
    # tag: "v1.0.0"
```

## Configuration  

### Use cases

You can use Metrics Server for:

- CPU/Memory based horizontal autoscaling (learn more about [Horizontal Autoscaling](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/))
- Automatically adjusting/suggesting resources needed by containers (learn more about [Vertical Autoscaling](https://github.com/kubernetes/autoscaler/tree/master/vertical-pod-autoscaler/))

Metrics Server offers:

- A single deployment that works on most clusters (see [Requirements](#requirements))
- Fast autoscaling, collecting metrics every 15 seconds.
- Resource efficiency, using 1 mili core of CPU and 2 MB of memory for each node in a cluster.
- Scalable support up to 5,000 node clusters.

Don't use Metrics Server when you need:

- Non-Kubernetes clusters
- An accurate source of resource usage metrics
- Horizontal autoscaling based on other resources than CPU/Memory

For unsupported use cases, check out full monitoring solutions like [Prometheus](https://github.com/prometheus/prometheus).


### Requirements

Metrics Server has specific requirements for cluster and network configuration. These requirements aren't the default for all cluster
distributions. Please ensure that your cluster distribution supports these requirements before using Metrics Server:

- The kube-apiserver must [enable an aggregation layer](https://kubernetes.io/docs/tasks/access-kubernetes-api/configure-aggregation-layer/).
- Nodes must have Webhook [authentication and authorization](https://kubernetes.io/docs/reference/access-authn-authz/kubelet-authn-authz/) enabled.
- Kubelet certificate needs to be signed by cluster Certificate Authority (or disable certificate validation by passing `--kubelet-insecure-tls` to Metrics Server)
- Container runtime must implement a [container metrics RPCs](https://github.com/kubernetes/community/blob/master/contributors/devel/sig-node/cri-container-stats.md) (or have [cAdvisor](https://github.com/google/cadvisor) support)
- Network should support following communication:
  - Control plane to Metrics Server. Control plane node needs to reach Metrics Server's pod IP and port 10250 (or node IP and custom port if `hostNetwork` is enabled). Read more about [control plane to node communication](https://kubernetes.io/docs/concepts/architecture/control-plane-node-communication/#control-plane-to-node).
  - Metrics Server to Kubelet on all nodes. Metrics server needs to reach node address and Kubelet port. Addresses and ports are configured in Kubelet and published as part of Node object. Addresses in `.status.addresses` and port in `.status.daemonEndpoints.kubeletEndpoint.port` field (default 10250). Metrics Server will pick first node address based on the list provided by `kubelet-preferred-address-types` command line flag (default `InternalIP,ExternalIP,Hostname` in manifests).


### Security context

Metrics Server requires the `CAP_NET_BIND_SERVICE` capability in order to bind to a privileged ports as non-root.
If you are running Metrics Server in an environment that uses [PSSs](https://kubernetes.io/docs/concepts/security/pod-security-standards/) or other mechanisms to restrict pod capabilities, ensure that Metrics Server is allowed
to use this capability.
This applies even if you use the `--secure-port` flag to change the port that Metrics Server binds to a non-privileged port.

### Scaling

Starting from v0.5.0 Metrics Server comes with default resource requests that should guarantee good performance for most cluster configurations up to 100 nodes:

- 100m core of CPU
- 200MiB of memory

Metrics Server resource usage depends on multiple independent dimensions, creating a [Scalability Envelope](https://github.com/kubernetes/community/blob/master/sig-scalability/configs-and-limits/thresholds.md).
Default Metrics Server configuration should work in clusters that don't exceed any of the thresholds listed below:

Quantity               | Namespace threshold | Cluster threshold
-----------------------|---------------------|------------------
Nodes                  | n/a                 | 100
Pods per node          | 70                  | 70
Deployments with HPAs  | 100                 | 100

Resources can be adjusted proportionally based on number of nodes in the cluster.
For clusters of more than 100 nodes, allocate additionally:

- 1m core per node
- 2MiB memory per node

You can use the same approach to lower resource requests, but there is a boundary
where this may impact other scalability dimensions like maximum number of pods per node.


### Configuration

Depending on your cluster setup, you may also need to change flags passed to the Metrics Server container.
Most useful flags:

- `--kubelet-preferred-address-types` - The priority of node address types used when determining an address for connecting to a particular node (default [Hostname,InternalDNS,InternalIP,ExternalDNS,ExternalIP])
- `--kubelet-insecure-tls` - Do not verify the CA of serving certificates presented by Kubelets. For testing purposes only.
- `--requestheader-client-ca-file` - Specify a root certificate bundle for verifying client certificates on incoming requests.
- `--node-selector` -Can complete to scrape the metrics from the Specified nodes based on labels

You can get a full list of Metrics Server configuration flags by running:

```shell
docker run --rm registry.k8s.io/metrics-server/metrics-server:v0.7.2 --help
```

## Uninstallation

On the **Extensions Center** page, click **Metrics Server**, then click the icon next to **Installed** and choose **Uninstall** to start the uninstallation process.