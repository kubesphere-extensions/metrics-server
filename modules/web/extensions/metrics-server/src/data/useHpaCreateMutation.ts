import { request, PathParams, getApiVersion } from '@ks-console/shared';
import { get } from 'lodash';
import { useMutation, UseMutationOptions } from 'react-query';

const module = 'horizontalpodautoscalers';

type HpaCreateMutationProps = {
  params: PathParams;
  options?: UseMutationOptions<any, unknown, any>;
};
export const useHpaCreateMutation = (props: HpaCreateMutationProps) => {
  const { params, options } = props;
  const k8sVersion = globals.clusterConfig?.[params.cluster!]?.k8sVersion;
  const version = getApiVersion(module, k8sVersion);
  return useMutation(
    async (data: any) => {
      const response = await request.post(
        `/clusters/${params.cluster}/apis/${version}/namespaces/${params.namespace ? params.namespace : get(data, 'metadata.namespace')}/${module}`,
        data,
      );
      return response.data;
    },
    {
      onSuccess: options?.onSuccess,
    },
  );
};
