import { useMutation, MutateOptions } from 'react-query';
import { PathParams, request, getApiVersion } from '@ks-console/shared';

const module = 'horizontalpodautoscalers';

export const useBatchDeleteMutation = <T>(
  options?: MutateOptions<any, unknown, (Partial<T> & PathParams)[]>,
) => {
  const getDetailUrl = (item: Partial<T> & PathParams & { k8sVersion?: string }) => {
    const version = getApiVersion(module, item.k8sVersion);
    return `/clusters/${item.cluster}/apis/${version}/namespaces/${item.namespace}/${module}/${item.name}`;
  };

  const del = (item: Partial<T> & PathParams & { k8sVersion?: string }) => {
    const url = getDetailUrl(item);
    return request.delete(url);
  };

  const onSuccess = options?.onSuccess;
  return useMutation(
    (items: (Partial<T> & PathParams)[]) => {
      const promises = items.map(item => del(item));
      return Promise.allSettled(promises);
    },
    { onSuccess },
  );
};
