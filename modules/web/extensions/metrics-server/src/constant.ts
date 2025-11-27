const WORKLOAD_KIND_MAP = {
  Deployment: 'deployments',
  StatefulSet: 'statefulsets',
};

const WORKLOAD_KIND_TEXT_MAP = {
  Deployment: 'hpa.common.deployment',
  StatefulSet: 'hpa.common.statefulSet',
};

const STATUS_TITLE = {
  AbleToScale: 'hpa.scaleTarget.status.ableToScale',
  ScalingActive: 'hpa.scaleTarget.status.scalingActive',
  ScalingLimited: 'hpa.scaleTarget.status.scalingLimited',
};
const STATUS_DESCRIPTION = {
  AbleToScale: 'hpa.scaleTarget.status.ableToScale.description',
  ScalingActive: 'hpa.scaleTarget.status.scalingActive.description',
  ScalingLimited: 'hpa.scaleTarget.status.scalingLimited.description',
};

const ICON_TYPES = {
  False: { name: 'CloseCircleDuotone', color: '#AB2F29' },
  True: { name: 'success', color: '#55BC8A' },
  Unknown: { name: 'question', color: '#E0992C' },
};

const AUTH_KEY = 'autoscaling';

const HPA_READY_ANNOTATION_SELECTOR =
  'metadata.annotations.hpa\\.autoscaling\\.kubesphere\\.io/ready';

const HPA_STATUS_FILTERS = [
  {
    label: 'hpa.common.normal',
    value: `${HPA_READY_ANNOTATION_SELECTOR}=true`,
  },
  {
    label: 'hpa.common.abnormal',
    value: `${HPA_READY_ANNOTATION_SELECTOR}=false`,
  },
];

export {
  WORKLOAD_KIND_MAP,
  STATUS_TITLE,
  STATUS_DESCRIPTION,
  ICON_TYPES,
  WORKLOAD_KIND_TEXT_MAP,
  AUTH_KEY,
  HPA_STATUS_FILTERS,
};
