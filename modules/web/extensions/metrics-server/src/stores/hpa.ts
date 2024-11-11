import { getBaseInfo, getOriginData, PathParams, getApiVersion } from '@ks-console/shared';
import { getStoreWithQueryHooks } from './useStore';
import { get } from 'lodash';
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
  const cpuCurrentUtilization =
    findCurrent(status?.currentMetrics, 'cpu')?.current?.averageUtilization || 0;
  const memoryCurrentValue =
    findCurrent(status?.currentMetrics, 'memory')?.current?.averageValue || 0;

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

// http://localhost:8000/clusters/host/apis/autoscaling/v2/namespaces/springboot-demo/horizontalpodautoscalers/111?name=111&labelSelector=autoscaling.kubeshpere.io%2Fscale-target-kind%3DDeployment,autoscaling.kubeshpere.io%2Fscale-target-name%3Dspringboot-actuator-demo&sortBy=createTime&limit=10

const getResourceUrl = (params: PathParams = {}) => {
  const apiVersion = getApiVersion(module, globals.clusterConfig?.[params.cluster!]?.k8sVersion);
  // return `${apiVersion}/${getPath(params)}/${module}`;
  const url = `/clusters/${params.cluster}/kapis/${apiVersion}/namespaces/${params.namespace}/horizontalpodautoscalers`;
  return url;
};

const baseStore = BaseStore({
  module,
  mapper,
  getResourceUrlFn: getResourceUrl,
  // getListUrlFn: getResourceUrl,
});

export default getStoreWithQueryHooks(baseStore);
