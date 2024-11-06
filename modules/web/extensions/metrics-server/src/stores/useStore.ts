/*
 * Please refer to the LICENSE file in the root directory of the project.
 * https://github.com/kubesphere/console/blob/master/LICENSE
 */

import { BaseStore, PathParams, useBaseWebSocket, WebSocketClient } from '@ks-console/shared';
import { get, merge, throttle } from 'lodash';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from 'react-query';

export interface SimpleStore
  extends Pick<
    ReturnType<typeof BaseStore>,
    | 'post'
    | 'put'
    | 'patch'
    | 'delete'
    | 'batchDelete'
    | 'fetchDetail'
    | 'fetchList'
    | 'getWatchUrl'
    | 'getWatchListUrl'
    | 'mapper'
  > {
  module: string;
  [key: string]: any;
}

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

const useWebsocket = (config: { url: string; refetch: Function; enabled: boolean }) => {
  const { url, enabled = false, refetch } = config;
  useBaseWebSocket({
    url,
    enabled,
    onMessage: (message: Record<string, any>) => {
      if (message.type !== 'DELETED') {
        refetch();
      }
    },
  });
};

const useListWebsocket = <T extends Record<string, any>>(config: {
  url: string;
  queryKey: any[];
  refetch: Function;
  enabled: boolean;
  mapper?: (d: Record<string, any>) => T;
}) => {
  const { url = '', enabled = false, refetch, queryKey, mapper = (d: T) => d } = config;
  const queryClient = useQueryClient();
  useBaseWebSocket({
    url,
    enabled,
    onMessage: (message: Record<string, any>) => {
      const data = queryClient.getQueryData(queryKey) as { data: T[] } | undefined;

      if (!data) {
        return;
      }
      if (message.type === 'MODIFIED') {
        const index = data?.data?.findIndex(i => i.name === get(message, 'object.metadata.name'));
        if (index !== -1) {
          data.data[index] = mapper(message.object);
          data.data = [...data.data];
          return queryClient.setQueryData(queryKey, data);
        }
      }
      refetch();
    },
  });
};

const getQueryDetail = (store: SimpleStore) => {
  return <P>(params: PathParams, options: Record<string, any> = {}) => {
    const watch = options.watch ?? false;
    const queryKey = [`Detail${store.module}`, params];
    const result = useQuery<P>({
      queryKey,
      queryFn: () => store.fetchDetail(params),
      ...options,
      enabled: (options?.enabled ?? true) && !!params.name,
    });
    useWebsocket({
      url: store.getWatchUrl(params),
      enabled: watch,
      refetch: result.refetch,
    });

    return result;
  };
};

const getUseQueryList = (store: SimpleStore) => {
  return <P extends Record<string, any>>(
    params: PathParams & Record<string, any> = {},
    options: Record<string, any> = {},
  ) => {
    const queryKey = [`List${store.module}`, params];
    const watch = options.watch ?? false;

    const result = useQuery<P>({
      queryKey,
      queryFn: () => {
        return store.fetchList(params);
      },
      ...options,
    });
    useListWebsocket({
      url: store.getWatchListUrl(params),
      queryKey,
      enabled: watch,
      refetch: result.refetch,
      mapper: store.mapper,
    });
    return result;
  };
};

const getUseInfinityQueryList = (store: SimpleStore) => {
  return <P extends Record<string, any>>(
    params: PathParams & Record<string, any> = {},
    options: Record<string, any> = {},
  ) => {
    const queryKey = [`Infinity${store.module}`, params];
    const ret = useInfiniteQuery<P>(
      queryKey,
      ({ pageParam = params }) => {
        return store.fetchList({ ...params, ...pageParam });
      },
      { getNextPageParam, ...options },
    );
    return {
      ...ret,
      data: ret.data?.pages?.flatMap(({ data = [] }) => data),
    };
  };
};

export type MutationOp =
  | 'POST'
  | 'PUT'
  | 'PATCH'
  | 'UPDATE'
  | 'DELETE'
  | 'BATCH_DELETE'
  | 'BATCH_PATCH';

export const getMutations = (store: SimpleStore) => {
  return (op?: MutationOp, defaultParams?: PathParams, options: Record<string, any> = {}) => {
    return useMutation(async ({ op: op1, params, data, config = {} }: Record<string, any>) => {
      const p = merge({}, defaultParams, params);
      switch (op1 ?? op) {
        case 'POST':
          return store.post(p, data);
        case 'PUT':
          return store.put(p, data);
        case 'PATCH':
        case 'UPDATE':
          return store.patch(p, data, config);
        case 'DELETE':
          return store.delete(data);
        case 'BATCH_DELETE':
          return store.batchDelete(data);
        case 'BATCH_PATCH':
          return store.batchPatch(data);
        default:
          throw new Error(`unknown op: ${op1 ?? op}`);
      }
    }, options);
  };
};

export const getStoreWithQueryHooks = <T extends SimpleStore>(
  store: T,
): T & {
  useQueryDetail: ReturnType<typeof getQueryDetail>;
  useMutations: ReturnType<typeof getMutations>;
  useInfiniteQueryList: ReturnType<typeof getUseInfinityQueryList>;
  useQueryList: ReturnType<typeof getUseQueryList>;
} => {
  return {
    ...store,
    useQueryDetail: getQueryDetail(store),
    useMutations: getMutations(store),
    useInfiniteQueryList: getUseInfinityQueryList(store),
    useQueryList: getUseQueryList(store),
  };
};
