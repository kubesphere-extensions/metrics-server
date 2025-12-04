import {
  PathParams,
  formatFetchListParams,
  FetchListParams,
  request,
  getPath,
  OriginalNamespace,
  FormattedNamespace,
  getBaseInfo,
  getOriginData,
  requestHelper,
} from '@ks-console/shared';
import { useInfiniteQuery } from 'react-query';
import qs from 'qs';
import { get } from 'lodash';
const { getPaginationInfo } = requestHelper;

const module = 'namespace';
const getNextPageParam = (lastPage: Record<string, any>) => {
  const { data, total, limit, page, ...rest } = lastPage;
  const hasNextPage = limit * (page - 1) + data.length < total;
  if (hasNextPage) {
    const nextParams = {
      ...rest,
      page: lastPage.page + 1,
      limit,
    };
    return nextParams;
  }
  return undefined;
};

function getResourceUrl({ workspace, ...params }: PathParams): string {
  if (workspace) {
    return `kapis/tenant.kubesphere.io/v1beta1/workspaces/${workspace}${getPath(
      params,
    )}/namespaces`;
  }

  return `kapis/resources.kubesphere.io/v1alpha3${getPath(params)}/namespaces`;
}

function mapper(item: OriginalNamespace): FormattedNamespace {
  return {
    ...getBaseInfo(item),
    labels: get(item, 'metadata.labels', {}),
    annotations: get(item, 'metadata.annotations', {}),
    workspace: get(item, 'metadata.labels["kubesphere.io/workspace"]', ''),
    status: get(item, 'status.phase'),
    isFedHostNamespace:
      get(item, 'metadata.labels["kubesphere.io/kubefed-host-namespace"]') === 'true',
    enableLogCollection:
      get(item, 'metadata.labels["logging.kubesphere.io/logsidecar-injection"]') === 'enabled',
    _originData: getOriginData(item),
  };
}
const fetchList = async (
  { cluster, workspace, namespace, devops, ...params } = {} as FetchListParams,
): Promise<any> => {
  const formattedParams = formatFetchListParams(module, params);
  let url = '';
  url = getResourceUrl({ cluster, workspace, namespace });
  url = `${url}?${qs.stringify(formattedParams)}`;
  const result: any = (await request.get(url)) ?? {};

  const data = (result.items || []).map((item: Record<string, unknown>) => ({
    cluster,
    namespace,
    ...item,
    ...mapper(item),
  }));

  const limit = Number(params.limit) || 10;
  const page = Number(params.page) || 1;
  const { totalItemCount } = getPaginationInfo({
    ...result,
    remainingItemCount: result.metadata?.remainingItemCount,
    limit,
    page,
    currentPageData: data,
  });

  return {
    data: data,
    total: totalItemCount,
    ...params,
    limit,
    page,
  };
};
export function useNamespaceList(
  params: PathParams & Record<string, any> = {},
  options: Record<string, any> = {},
) {
  const queryKey = [`Infinity-${module}`, params];
  const ret = useInfiniteQuery(
    queryKey,
    ({ pageParam = params }) => {
      return fetchList({ ...params, ...pageParam });
    },
    { getNextPageParam, ...options },
  );
  return {
    ...ret,
    data: ret.data?.pages?.flatMap(({ data = [] }) => data),
  };
}
