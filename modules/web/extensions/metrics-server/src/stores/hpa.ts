import { getBaseInfo, getOriginData, PathParams, getApiVersion } from '@ks-console/shared';
import { getStoreWithQueryHooks } from './useStore';
import BaseStore from './base';

// @ts-expect-error
const findMetric = (metrics, name) =>
  // @ts-expect-error
  metrics?.find(m => m.type === 'Resource' && m.resource.name === name)?.resource;
// @ts-expect-error
const findCurrent = (metrics, name) =>
  // @ts-expect-error
  metrics?.find(m => m.type === 'Resource' && m.resource.name === name)?.resource?.current;
const mapper = (item: Record<string, any>) => {
  const baseInfo = getBaseInfo(item);
  const { spec = {}, status } = item;
  const cpuTargetUtilization = findMetric(spec?.metrics, 'cpu')?.target?.averageUtilization || '';
  const memoryTargetValue = findMetric(spec?.metrics, 'memory')?.target?.averageValue || '';
  const cpuCurrentUtilization = findCurrent(status?.currentMetrics, 'cpu')?.averageValue || 0;
  const memoryCurrentValue = findCurrent(status?.currentMetrics, 'memory')?.averageValue || 0;

  return {
    ...baseInfo,
    minReplicas: spec.minReplicas,
    maxReplicas: spec.maxReplicas,
    cpuTargetUtilization,
    memoryTargetValue,
    cpuCurrentUtilization,
    memoryCurrentValue,
    _originData: getOriginData(item),
  };
};

const module = 'horizontalpodautoscalers';

const getResourceUrl = (params: PathParams = {}) => {
  const apiVersion = getApiVersion(module, globals.clusterConfig?.[params.cluster!]?.k8sVersion);
  const url = `/clusters/${params.cluster}/kapis/${apiVersion}/namespaces/${params.namespace}/horizontalpodautoscalers`;
  return url;
};

const baseStore = BaseStore({
  module,
  mapper,
  getResourceUrlFn: getResourceUrl,
});

export default getStoreWithQueryHooks(baseStore);
