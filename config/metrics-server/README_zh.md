## 功能

Metrics Server 是一个可扩展、高效的容器资源度量源，为 Kubernetes 内置的自动扩展管道提供服务。

Metrics Server 从 Kubelet 收集资源指标，并通过 [Metrics API](https://github.com/kubernetes/metrics) 在 Kubernetes apiserver 中公开它们，供 [Horizontal Pod Autoscaler](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/) 和 [Vertical Pod Autoscaler](https://github.com/kubernetes/autoscaler/tree/master/vertical-pod-autoscaler/) 使用。Metrics API 也可以被 `kubectl top` 访问，从而更容易调试自动缩放流水线。

Metrics Server 不适用于非自动缩放目的。例如，请勿将其用于将指标转发到监控解决方案，或用作监控解决方案指标的来源。在这种情况下，请直接从 Kubelet `/metrics/resource` 端点收集指标。

## 快速开始

安装完成后，点击集群或项目的工作负载，进入部署或有状态副本集的详情页，可创建 **Pod 水平自动扩缩**。

设置后，系统将根据您设定的目标 CPU 和内存用量，自动调整工作负载的容器组副本数量。

## 升级

**⚠️ 注意事项**

在升级扩展组件时，请务必确认镜像标签配置是否符合预期。新版本通常会使用新的镜像标签，如果您在配置中显式指定了旧的镜像标签，可能会导致升级后仍拉取旧版本镜像，无法获得最新功能或修复。

为确保升级顺利进行，请遵循以下建议：

1. **检查并移除手动设置的镜像标签**，或将其更新为新版本所需的镜像标签。
2. **推荐使用默认配置**，以自动获取与当前版本匹配的镜像标签及配置。

以下是本扩展组件中涉及的镜像标签配置路径：

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

## 配置

### 用途

Metrics Server 可实现如下功能：

- 基于 CPU/内存的水平自动缩放（了解更多关于 [Horizontal Autoscaling](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/)）
- 自动调整/建议容器所需的资源（了解更多关于 [Vertical Autoscaling](https://github.com/kubernetes/autoscaler/tree/master/vertical-pod-autoscaler/)）

Metrics Server 提供：

- 单个部署可在大多数集群上运行（参见 [要求](#要求)）
- 快速自动缩放，每 15 秒收集一次指标。
- 资源效率，每个集群节点使用 1 毫核 CPU 和 2 MB 内存。
- 可扩展支持多达 5,000 个节点的集群。

Metrics Server 不适用于以下场景：

- 非 Kubernetes 集群
- 资源使用情况指标的准确来源
- 基于 CPU/内存之外的其他资源进行水平自动缩放

对于不支持的用例，请查看完整的监控解决方案，如 [Prometheus](https://github.com/prometheus/prometheus)。

### 要求

Metrics Server 对集群和网络配置有特定要求。这些要求不是所有集群分发的默认设置。在使用 Metrics Server 之前，请确保您的集群分发支持以下要求：

- kube-apiserver 必须 [启用聚合层](https://kubernetes.io/docs/tasks/access-kubernetes-api/configure-aggregation-layer/)。
- 节点必须启用 Webhook [身份验证和授权](https://kubernetes.io/docs/reference/access-authn-authz/kubelet-authn-authz/)。
- Kubelet 证书需要由集群证书颁发机构签名（或者通过向 Metrics Server 传递 `--kubelet-insecure-tls` 禁用证书验证）。
- 容器运行时必须实现 [容器指标 RPCs](https://github.com/kubernetes/community/blob/master/contributors/devel/sig-node/cri-container-stats.md)（或具有 [cAdvisor](https://github.com/google/cadvisor) 支持）。
- 网络应支持以下通信：
  - 控制平面到 Metrics Server。控制平面节点需要能够访问 Metrics Server 的 pod IP 和端口 10250（或者如果启用了 `hostNetwork` 则是节点 IP 和自定义端口）。了解更多关于 [控制平面到节点通信](https://kubernetes.io/docs/concepts/architecture/control-plane-node-communication/#control-plane-to-node)。
  - Metrics Server 到所有节点的 Kubelet。Metrics Server 需要能够访问节点地址和 Kubelet 端口。地址和端口在 Kubelet 中配置，并作为 Node 对象的一部分发布。地址在 `.status.addresses` 中，端口在 `.status.daemonEndpoints.kubeletEndpoint.port` 字段中（默认为 10250）。Metrics Server 将根据 `kubelet-preferred-address-types` 命令行标志提供的列表选择第一个节点地址（清单中默认为 `InternalIP,ExternalIP,Hostname`）。


### 安全上下文

Metrics Server 需要 `CAP_NET_BIND_SERVICE` 能力才能将其绑定到非根特权端口。如果您在使用 [PSSs](https://kubernetes.io/docs/concepts/security/pod-security-standards/) 或其他机制来限制 pod 能力的环境中运行 Metrics Server，请确保允许 Metrics Server 使用此能力。即使您使用 `--secure-port` 标志将 Metrics Server 绑定到非特权端口，也适用此规则。

### 扩展

从 v0.5.0 开始，Metrics Server 带有默认的资源请求，应保证大多数集群配置下性能良好，最多可达 100 个节点：

- 100 毫核 CPU
- 200 MiB 内存

Metrics Server 资源使用取决于多个独立的维度，创建了一个 [可扩展性范围](https://github.com/kubernetes/community/blob/master/sig-scalability/configs-and-limits/thresholds.md)。默认 Metrics Server 配置应在不超过以下任何阈值的集群中工作：

数量                   | 命名空间阈值       | 集群阈值
-----------------------|---------------------|------------------
节点                   | 无                  | 100
每个节点的 Pod 数量   | 70                  | 70
具有 HPA 的部署数量   | 100                 | 100

资源可以根据集群中节点数量进行比例调整。对于超过 100 个节点的集群，请另外分配：

- 每个节点 1 毫核
- 每个节点 2 MiB 内存

您可以使用相同的方法降低资源请求，但是存在一个边界，超出该边界可能会影响其他可扩展性维度，如每个节点的最大 Pod 数量。


### 配置

根据您的集群设置，您可能还需要更改传递给 Metrics Server 容器的标志。最有用的标志包括：

- `--kubelet-preferred-address-types` - 用于确定连接到特定节点的地址时使用的节点地址类型的优先级（默认为 [Hostname,InternalDNS,InternalIP,ExternalDNS,ExternalIP]）。
- `--kubelet-insecure-tls` - 不验证 Kubelets 提供的服务证书的 CA。仅用于测试目的。
- `--requestheader-client-ca-file` - 指定用于验证传入请求上的客户端证书的根证书捆绑包。
- `--node-selector` - 根据标签完成从指定节点抓取指标

您可以通过运行以下命令获取 Metrics Server 配置标志的完整列表：

```shell
docker run --rm registry.k8s.io/metrics-server/metrics-server:v0.7.2 --help
```

## 卸载

在**扩展中心**页面点击 **Metrics Server**，点击**已安装**旁边的图标，选择**卸载**，开始卸载流程。