import {
  request,
  formatFetchListParams,
  getBaseInfo,
  getOriginData,
  getApiVersion,
} from '@ks-console/shared';
import { useQuery } from 'react-query';
import { get } from 'lodash';

import { findTargetMetric, getTargetMetricValue, getCurrentMetricValue } from '../utils';
interface Metric {
  type: string;
  resource: {
    name: string;
    target?: {
      averageUtilization?: number;
      averageValue?: string;
    };
    current?: {
      averageValue?: string;
      averageUtilization?: number;
    };
  };
}

interface HpaItem {
  spec: {
    minReplicas: number;
    maxReplicas: number;
    metrics?: Metric[];
  };
  status: {
    currentMetrics?: Metric[];
  };
}

const getFilterParams = (params: Record<string, any>) => {
  const result = { ...params };
  if (result.app) {
    result.labelSelector = result.labelSelector || '';
    result.labelSelector += `app.kubernetes.io/name=${result.app}`;
    delete result.app;
  }
  return result;
};
const module = 'horizontalpodautoscalers';

const mapper = (item: HpaItem) => {
  const baseInfo = getBaseInfo(item);
  const spec = item.spec || { minReplicas: 0, maxReplicas: 0 };
  const { status } = item;

  // Get CPU and Memory target types
  const cpuTargetType = findTargetMetric(spec?.metrics, 'cpu')?.target?.type || '';
  const memoryTargetType = findTargetMetric(spec?.metrics, 'memory')?.target?.type || '';

  return {
    ...baseInfo,
    minReplicas: spec.minReplicas,
    maxReplicas: spec.maxReplicas,
    // CPU target value (could be percentage or absolute value)
    cpuTargetUtilization: getTargetMetricValue(spec?.metrics, 'cpu'),
    cpuTargetType, // Add type information
    // Memory target value (could be percentage or absolute value)
    memoryTargetValue: getTargetMetricValue(spec?.metrics, 'memory'),
    memoryTargetType, // Add type information
    // CPU current value (prefer value that matches target type)
    cpuCurrentUtilization: getCurrentMetricValue(status?.currentMetrics, spec?.metrics, 'cpu'),
    // Memory current value (prefer value that matches target type)
    memoryCurrentValue: getCurrentMetricValue(status?.currentMetrics, spec?.metrics, 'memory'),
    _originData: getOriginData(item),
  };
};

export const useHpaList = (query: Record<string, any>, options: Record<string, any>) => {
  const queryKey = [`List-${module}`, query];
  const { cluster, namespace, ...params } = query;
  const result = useQuery({
    queryKey,
    queryFn: async () => {
      const formattedParams = formatFetchListParams(module, params);
      const { headers, ...params1 } = getFilterParams(formattedParams);
      const apiVersion = getApiVersion(module, globals.clusterConfig?.[cluster!]?.k8sVersion);
      const url = namespace
        ? `/clusters/${cluster}/kapis/${apiVersion}/namespaces/${namespace}/horizontalpodautoscalers`
        : `/clusters/${cluster}/kapis/${apiVersion}/horizontalpodautoscalers`;
      const result: any =
        (await request.get(url, {
          params: params1,
          headers,
        })) ?? {};

      const data = (result.items || []).map((item: Record<string, unknown>) => ({
        cluster,
        namespace: namespace ? namespace : get(item, 'metadata.namespace', ''),
        ...item,
        ...mapper(item as unknown as HpaItem),
      }));

      return {
        data: data,
        total:
          result.totalItems ||
          result.totalCount ||
          result.total_count ||
          get(result, 'metadata.continue', 0) ||
          data.length ||
          0,
        ...params,
        limit: Number(params.limit) || 10,
        page: Number(params.page) || 1,
      };
    },
    ...options,
  });
  return result;
};
