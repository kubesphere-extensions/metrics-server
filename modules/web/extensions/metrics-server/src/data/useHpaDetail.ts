import { useQuery } from 'react-query';
import { request, getApiVersion, getOriginData } from '@ks-console/shared';
import { useParams } from 'react-router-dom';

const useHpaDetail = (query: Record<string, any>, options: Record<string, any> = {}) => {
  const module = 'horizontalpodautoscalers';
  const { cluster, namespace, name } = query;
  const queryKey = [`Detail-${module}`, cluster, namespace, name, globals.clusterConfig];
  const result = useQuery({
    queryKey,
    queryFn: async () => {
      const apiVersion = getApiVersion(module, globals.clusterConfig?.[cluster!]?.k8sVersion);
      const url = `/clusters/${cluster}/kapis/${apiVersion}/namespaces/${namespace}/horizontalpodautoscalers/${name}`;
      const result: any = (await request.get(url)) ?? {};

      return {
        ...result,
        namespace,
        name,
        cluster,
        uid: result?.metadata?.uid,
        description: result?.metadata?.annotations?.['kubesphere.io/description'] ?? '',
        _originData: getOriginData(result),
      };
    },
    ...options,
  });
  return result;
};

export { useHpaDetail };
