import { useQuery } from 'react-query';
import { request } from '@ks-console/shared';
import { useParams } from 'react-router-dom';
import { get } from 'lodash';

const useHpaEvents = (query: Record<string, any>, options?: Record<string, any>) => {
  const { cluster, namespace, ...params } = query;
  const queryKey = ['hpa-events', query];
  const result = useQuery({
    queryKey,
    queryFn: async () => {
      const result: any = await request.get(
        `/clusters/${cluster}/api/v1/namespaces/${namespace}/events`,
        { params },
      );
      const data = (result.items || []).map((item: Record<string, unknown>) => ({
        cluster,
        namespace: namespace ? namespace : get(item, 'metadata.namespace', ''),
        ...item,
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
    enabled: !!cluster && !!namespace,
  });
  return result;
};

export { useHpaEvents };
