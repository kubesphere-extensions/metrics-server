import { request, PathParams, getApiVersion } from '@ks-console/shared';
import { useMutation } from 'react-query';

const module = 'horizontalpodautoscalers';

export const useEditMutation = (
  params: PathParams,
  options?: {
    onSuccess?: (data: any) => void;
  },
) => {
  const k8sVersion = globals.clusterConfig?.[params.cluster!]?.k8sVersion;
  const version = getApiVersion(module, k8sVersion);
  const url = `/clusters/${params.cluster}/apis/${version}/namespaces/${params.namespace}/${module}/${params.name}`;
  return useMutation((data?: Record<string, any>) => request.patch(url, data), {
    onSuccess: options?.onSuccess,
  });
};
