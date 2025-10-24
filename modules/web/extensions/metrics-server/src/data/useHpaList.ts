import {
  request,
  formatFetchListParams,
  getBaseInfo,
  getOriginData,
  getApiVersion,
} from '@ks-console/shared';
import { useQuery } from 'react-query';
import { get } from 'lodash';

import { findCurrentMetric, findTargetMetric } from '../utils';
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

  // Get Memory's configured type
  const memoryMetric = findTargetMetric(spec?.metrics, 'memory');
  const memoryTargetType = memoryMetric?.target?.type || '';

  // Helper function: extract target metric value based on configured type
  const getTargetValue = (metricName: string): string | number => {
    const metric = findTargetMetric(spec?.metrics, metricName);
    if (!metric?.target) return '';

    // Prefer averageUtilization (percentage), otherwise return averageValue (absolute value)
    return metric.target.averageUtilization ?? metric.target.averageValue ?? '';
  };

  // Helper function: extract current metric value based on configured type
  // Prioritize value that matches the target type
  const getCurrentValue = (metricName: string, targetType?: string): string | number => {
    const metric = findCurrentMetric(status?.currentMetrics, metricName);
    if (!metric) return 0;

    // If target type is specified, prefer the corresponding type value
    if (targetType === 'Utilization') {
      return metric.averageUtilization ?? metric.averageValue ?? 0;
    } else if (targetType === 'AverageValue') {
      return metric.averageValue ?? metric.averageUtilization ?? 0;
    }

    // Default: prefer averageUtilization, otherwise return averageValue
    return metric.averageUtilization ?? metric.averageValue ?? 0;
  };

  // Get CPU's configured type
  const cpuMetric = findTargetMetric(spec?.metrics, 'cpu');
  const cpuTargetType = cpuMetric?.target?.type || '';

  return {
    ...baseInfo,
    minReplicas: spec.minReplicas,
    maxReplicas: spec.maxReplicas,
    // CPU target value (could be percentage or absolute value)
    cpuTargetUtilization: getTargetValue('cpu'),
    cpuTargetType, // Add type information
    // Memory target value (could be percentage or absolute value)
    memoryTargetValue: getTargetValue('memory'),
    memoryTargetType, // Add type information
    // CPU current value (prefer value that matches target type)
    cpuCurrentUtilization: getCurrentValue('cpu', cpuTargetType),
    // Memory current value (prefer value that matches target type)
    memoryCurrentValue: getCurrentValue('memory', memoryTargetType),
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
