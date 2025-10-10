const WORKLOAD_KIND_MAP = {
  Deployment: 'deployments',
  StatefulSet: 'statefulsets',
};

const STATUS_TITLE = {
  AbleToScale: '可伸缩',
  ScalingActive: '指标有效',
  ScalingLimited: '副本不受限',
};
const STATUS_DESCRIPTION = {
  AbleToScale: '是否允许新的弹性伸缩操作',
  ScalingActive: '是否成功获取有效指标并计算期望副本数',
  ScalingLimited: '期望副本数是否受限于最小副本数或最大副本数。',
};

const ICON_TYPES = {
  False: { name: 'CloseCircleDuotone', color: '#AB2F29' },
  True: { name: 'success', color: '#55BC8A' },
  Unknown: { name: 'question', color: '#E0992C' },
};

export { WORKLOAD_KIND_MAP, STATUS_TITLE, STATUS_DESCRIPTION, ICON_TYPES };
