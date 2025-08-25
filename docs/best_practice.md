# 容器水平伸缩 (HPA) 最佳实践

如果您想基于 CPU 使用率、内存使用率或其他自定义指标实现 Pod 的自动扩缩，建议您为业务容器开启容器水平伸缩 HPA（Horizontal Pod Autoscaler）功能。HPA 能够在业务负载急剧飙升时快速扩容多个 Pod 副本来缓解压力，也可以在业务负载变小时根据实际情况适当缩容以节省资源，无需您人为干预。HPA 适用于服务波动较大、服务数量多且需要频繁扩缩容的业务场景。

## 使用容器水平伸缩 (HPA)

创建 HorizontalPodAutoscaler 资源并关联工作负载，设定触发条件，如下方配置。当 HPA 创建成功且达到伸缩条件时，工作负载副本数将按 [算法](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/#how-does-a-horizontalpodautoscaler-work) 调整， 进行水平扩缩。

```
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: nginx-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: nginx
  minReplicas: 1  # Deployment可缩容的容器数量下限，需设置为大于等于1的整数。
  maxReplicas: 10  # 该Deployment可扩容的容器数量上限，需大于minReplicas。
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 50 # 目标资源的平均使用率，即资源使用量的平均值与其请求量之间的比例。
  - type: Resource
    resource:
      name: memory
      target:
        type: AverageValue
        averageValue: 500Mi # 目标资源的平均用量               
```

## 调节容器水平伸缩 (HPA) 扩缩容灵敏度

如果默认的扩缩容行为无法满足业务需求，您可以通过 behavior 字段更细粒度地配置缩容（scaleDown）和扩容（scaleUp）行为。更多信息，请参见 [配置扩缩行为](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/#configurable-scaling-behavior)。

behavior 支持的典型场景包括但不限于：

- 在流量急剧上升时实现快速扩容。
- 在负载波动频繁的场景下实现快速扩容和缓慢缩容。
- 对状态敏感的应用实现禁止缩容。
- 在资源有限或成本敏感的场景中，通过稳定窗口 stabilizationWindowSeconds 来限制扩容的速度，减少因短暂波动导致的频繁调整。

### behavior 配置说明

在 HPA 配置中，behavior 是一个可选字段，支持对自动扩缩容行为进行更细粒度的控制。behavior 主要通过 scaleDown 和 scaleUp 子字段定义扩容和缩容的具体行为，以更好地满足应用的实际需求，避免资源的过度分配或不足，从而提高资源利用率和应用性能。

一个包括 behavior 字段的 HPA 配置示例如下。示例中 behavior 配置均为默认配置。您可按需配置自定义字段的取值，未指定的字段将使用默认值。

```yaml
apiVersion: autoscaling/v2beta2
kind: HorizontalPodAutoscaler
metadata:
  name: sample-hpa
spec:
  minReplicas: 1
  maxReplicas: 100
  metrics:
  - pods:
      metric:
        name: http_requests_per_second
      target:
        averageValue: 50
        type: AverageValue
    type: Pods
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: sample-app
  behavior:  # 以下配置为默认配置，您可以按需自定义字段。
    scaleDown: # 通过此字段配置自定义的缩容行为。
      stabilizationWindowSeconds: 300
      policies: 
      - type: Pods
        value: 10 
        periodSeconds: 15
    scaleUp:  # 通过此字段配置自定义的扩容行为。
      stabilizationWindowSeconds: 0
      policies:
      - type: Percent
        value: 100
        periodSeconds: 15
      - type: Pods
        value: 4
        periodSeconds: 15
      selectPolicy: Max
```

在示例 YAML 中，通过 scaleDown 字段定义了稳定窗口（stabilizationWindowSeconds）为 300 秒，并在 policies 中声明了具体的缩容策略。这表明 HPA 缩容时会考虑 5 分钟内所有建议的副本数，从中选择最大值，且每 15 秒最多缩容 10 个 Pod，避免指标波动而导致的频繁缩容。

同时，在 scaleUp 字段中，稳定窗口为 0，即当指标表明需要扩容时 HPA 会立即进行扩容操作。定义了两种扩容策略以及策略的选择方式：每 15 秒最多添加当前运行副本数的 100%，或每 15 秒最多添加 4 个 Pod，HPA 会在扩容时选择增加副本数较多的策略。

scaleDown 和 scaleUp 支持自定义字段及其说明如下。

| 参数名称                   | 说明                                                                                                                                      |
|----------------------------|-----------------------------------------------------------------------------------------------------------------------------------------|
| stabilizationWindowSeconds | 稳定窗口用于在指标持续波动时避免副本数频繁增减。HPA 会考虑可配置窗口时间内的所有建议副本数。如配置为 scaleDown，HPA 会从所有副本数中选择最大值；如配置为 scaleUp，HPA 则会选择最小值。单位为秒（s）。 |
| policies                   | 定义一个或多个缩容策略，每个策略包含 type（例如 Percent、Pods）和 value，用于详细说明在满足缩容条件时如何减少 Pod 的数量，例如每次减少百分比或固定数量的 Pod。                     |
| selectPolicy               | 存在多个缩容策略可用时，指定选择哪个策略。可选值：Min、Max 或 Disabled。如配置为 scaleDown，Max 代表在符合条件的情况下，选择减小最多副本数的策略进行缩容；如配置为 scaleUp，则选择增加最多副本数的策略进行扩容。 |

下文结合不同场景示例介绍如何通过 behavior 字段来对扩缩容行为进行更细粒度的配置。

### 快速扩容

在特定事件（例如促销、产品发布等）期间，应用可能会经历突然的流量激增。当需要快速扩容时，您可以参见如下配置实现快速扩容。

```yaml
behavior:
  scaleUp:
    policies:
    - type: Percent
      value: 900
      periodSeconds: 15
```

在上方配置中，将在 15 秒的时间窗口内尝试将当前 Pod 数量增加 900%，从而使副本数达到当前的 10 倍（但不能超过 maxReplicas 的限制）。假如您初始 Pod 数量为 1，在流量突发并且指标持续超出阈值时，扩容时 Pod 数量变化将呈如下趋势。

```
1 -> 10 -> 100 -> 1000
```

### 快速扩容，缓慢缩容

在对应用性能要求高且负载波动频繁的场景，为避免在流量高峰后执行缩容时有不易预测的流量高峰再次到来，继而保障系统的稳定运行、及时响应请求，您可以参见如下配置实现快速扩容和缓慢缩容。

```yaml
behavior:
  scaleUp:
    policies:
    - type: Percent
      value: 900
      periodSeconds: 60
  scaleDown:
    policies:
    - type: Pods
      value: 1
      periodSeconds: 600 # 每10分钟减少一个pod。
```

在上方配置中，当扩容时，在 60 秒的时间窗口内，每次将增加当前 Pod 数量的 900%。如果指标持续低于阈值，当缩容时，在 600 秒（即 10 分钟）的时间窗口内，最多缩容 1 个 Pod。

### 禁止缩容

对于运行中的关键任务或状态敏感的应用，缩容可能导致不必要的中断或负载迁移。您可以参见下方配置实现禁止缩容，确保任务应用的高可用性和稳定性。

```yaml
behavior:
  scaleDown:
    selectPolicy: Disabled
```

### 延长或缩短缩容时间窗口

在资源有限或成本敏感的场景中，快速扩容可能导致资源耗尽或成本激增。您可以参见下方配置使用 stabilizationWindowSeconds 来限制扩容的速度，减少因短暂波动导致的频繁调整，从而控制资源消耗，降低集群成本。

```yaml
behavior:
  scaleDown:
    stabilizationWindowSeconds: 600
    policies:
    - type: Pods
      value: 5
      periodSeconds: 600
```

在上方配置中，即使缩容阈值低于目标值，HPA 也不会立即进行缩容操作，而会等待 600 秒（即 10 分钟）的时间窗口期，确认指标是否持续低于目标值。在时间窗口期内，每次缩容至多缩容 5 个 Pod。如果您希望指标达到阈值后立即执行扩缩容，无须等待稳定窗口，可以将 stabilizationWindowSeconds 配置为 0。

### 同时配置多个扩容策略

如果您的业务流量增长模式多变且不可预测，您可以参见下方配置同时定义多个扩缩容策略，确保系统能够灵活地应对各种不同的流量模式，从而实现快速而有效的扩展。

```yaml
  behavior:
    scaleUp:
      policies:
      - type: Pods # 基于Pod数量的扩容策略。
        value: 4
        periodSeconds: 60
      - type: Percent  # 基于百分比的扩容策略。
        value: 50
        periodSeconds: 60
      selectPolicy: Max
```

在上方配置中，scaleUp 中配置了两个策略。

一个策略基于 Pod 数量，每 1 分钟最多扩容 4 个 Pod。

一个策略基于百分比，每 1 分钟最多增加当前 Pod 数量 50% 的 Pod。

selectPolicy 设置为 Max，表示 HPA 会选择 policies 中增加 Pod 数量最多的策略来执行扩容。
