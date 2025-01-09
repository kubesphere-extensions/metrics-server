import { request, PathParams, getApiVersion, getHpaFormattedData, yaml } from '@ks-console/shared';
import { useMutation } from 'react-query';

const module = 'horizontalpodautoscalers';
export const useEditYamlMutation = (
  params: PathParams,
  options?: {
    onSuccess?: (data: any) => void;
  },
) => {
  const k8sVersion = globals.clusterConfig?.[params.cluster!]?.k8sVersion;
  const version = getApiVersion(module, k8sVersion);
  return useMutation(
    (data: { name: string; value: string }) => {
      const { name, value } = data;
      const objectValue = yaml.load(value);
      return request.patch(
        `/clusters/${params.cluster}/apis/${version}/namespaces/${params.namespace}/${module}/${name}`,
        getHpaFormattedData(objectValue, k8sVersion),
      );
    },
    {
      onSuccess: options?.onSuccess,
    },
  );
};
