import { useInfiniteQuery } from 'react-query';
import {
  request,
  getOriginData,
  getBaseInfo,
  getWorkloadUpdateTime,
  getLocalTime,
} from '@ks-console/shared';
import { get } from 'lodash';

export const useWorkloadList = ({
  cluster,
  namespace,
  module,
  query,
}: {
  cluster: string;
  namespace: string;
  module: 'deployments' | 'statefulsets';
  query: Record<string, any>;
}) => {
  const url = namespace
    ? `/clusters/${cluster}/kapis/resources.kubesphere.io/v1alpha3/namespaces/${namespace}/${module}`
    : `/clusters/${cluster}/kapis/resources.kubesphere.io/v1alpha3/${module}`;
  const res = useInfiniteQuery({
    queryKey: ['workloadListWithNamespace', cluster, namespace, module, query],
    queryFn: async ({ pageParam = 1 }) => {
      const result: any =
        (await request.get(url, {
          params: {
            ...query,
            page: pageParam,
            limit: query.limit || 10,
          },
        })) ?? {};
      const list = (result?.items ?? []).map((item: Record<string, any>) => ({
        ...getBaseInfo(item),
        labels: get(item, 'metadata.labels', {}),
        cluster,
        namespace,
        podNums: get(item, 'spec.replicas', 0),
        readyPodNums: get(item, 'status.readyReplicas', 0),
        availablePodNums: get(item, 'status.availableReplicas', 0),
        updateTime: getLocalTime(getWorkloadUpdateTime(item as any) as any).format(
          'YYYY-MM-DD HH:mm:ss',
        ),
        ...item,
        _originData: getOriginData(item),
      }));
      const total = result?.totalItems ?? result?.totalCount ?? result?.total_count ?? 0;
      const limit = Number(query.limit) || 10;
      return {
        list,
        total,
        page: pageParam,
        limit,
        hasNext: pageParam * limit < total,
      };
    },
    getNextPageParam: lastPage => {
      return lastPage.hasNext ? lastPage.page + 1 : undefined;
    },
  });

  const allItems = res.data?.pages.flatMap(page => page.list) || [];
  const total = res.data?.pages[0]?.total || 0;

  return {
    ...res,
    data: { list: allItems, total },
  };
};
