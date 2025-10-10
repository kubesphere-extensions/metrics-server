import React from 'react';

import { Navigate, Outlet } from 'react-router-dom';
import { ModalProvider } from '@ks-console/shared';
import { ClusterHpaList } from './list';
// import { DetailLayout } from '../workspace/DetailLayout';
import { ClusterHpaDetail } from './detail';
import { ResourceStatus } from '../../components/ResourceStatus/ResourceStatus';
import { Events } from '../../components/Events/Events';

const CLUSTER_PATH = '/clusters/:cluster';
const PROJECT_PATH = '/clusters/:cluster/projects/:namespace';

export const clusterRoutes = [
  {
    parentRoute: CLUSTER_PATH,
    element: (
      <ModalProvider>
        <Outlet />
      </ModalProvider>
    ),
    children: [
      {
        path: `${CLUSTER_PATH}/hpa-list`,
        element: <ClusterHpaList />,
      },
      {
        path: `${PROJECT_PATH}`,
        element: <Outlet />,
        children: [
          {
            path: `${PROJECT_PATH}/hpa-detail/:name`,
            element: <ClusterHpaDetail />,
            children: [
              {
                index: true,
                element: <Navigate to="resource-status" replace />,
              },
              {
                path: `resource-status`,
                element: <ResourceStatus />,
              },
              {
                path: `events`,
                element: <Events />,
              },
            ],
          },
        ],
      },
    ],
  },
];
