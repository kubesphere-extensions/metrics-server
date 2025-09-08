/*
 * Please refer to the LICENSE file in the root directory of the project.
 * https://github.com/kubesphere/console/blob/master/LICENSE
 */

import React from 'react';
import { set } from 'lodash';
import { useCacheStore as useStore } from '@ks-console/shared';
import { Loading } from '@kubed/components';
import { useQueries, useQuery } from 'react-query';
import { Outlet, useNavigate, useParams } from 'react-router-dom';
import { apis, ClusterDetail, clusterStore, projectStore } from '@ks-console/shared';

const { fetchDetail: fetchProjectDetail } = projectStore;
const { fetchDetail: fetchClusterDetail } = clusterStore;

function DetailLayout(): JSX.Element {
  const navigate = useNavigate();
  const userName = globals.user.username;
  const { cluster, namespace, workspace } = useParams<'workspace' | 'namespace' | 'cluster'>();
  const [, setProject] = useStore<any>('project');
  const [, setCluster] = useStore<ClusterDetail>('cluster');
  const [projectResult, clusterResult, workspaceRuleResult] = useQueries([
    {
      queryKey: ['project', 'detail', cluster, namespace, workspace],
      queryFn: () => fetchProjectDetail({ cluster, workspace, name: namespace }),
      onSuccess: setProject,
      enabled: !!cluster && !!namespace && !!workspace,
    },
    {
      queryKey: ['cluster', 'detail', cluster],
      queryFn: () => fetchClusterDetail({ name: cluster }),
      onSuccess: setCluster,
      enabled: !!cluster,
    },
    {
      queryKey: ['workspaceRule', workspace],
      queryFn: () => apis.fetchRules({ workspace, name: userName }),
      enabled: !!workspace,
    },
  ]);
  const holeRules = useQuery(
    ['holeRules'],
    () => apis.fetchRules({ cluster, workspace, namespace, name: userName }),
    {
      enabled: projectResult.isSuccess && clusterResult.isSuccess && workspaceRuleResult.isSuccess,
      onSuccess: () => {
        set(globals, `clusterConfig.${cluster}`, clusterResult.data?.configz);
      },
    },
  );

  if (
    projectResult.isLoading ||
    clusterResult.isLoading ||
    workspaceRuleResult.isLoading ||
    holeRules.isLoading
  ) {
    return <Loading className="page-loading" />;
  }

  if (!projectResult.data?.name) {
    navigate('/404');
    return <></>;
  }

  return <Outlet />;
}

export { DetailLayout };
