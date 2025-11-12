import React from 'react';

import { Navigate, Outlet } from 'react-router-dom';
import { ModalProvider } from '@ks-console/shared';
import { WorkSpaceHpaList } from './list';
import { WorkspaceHpaDetail } from './detail';
import { ResourceStatus } from '../../components/ResourceStatus/ResourceStatus';
import { Events } from '../../components/Events/Events';
import { DetailLayout } from './DetailLayout';

const WORKSPACE_PATH = '/workspaces/:workspace';
const PROJECT_PATH = '/workspaces/:workspace/clusters/:cluster/projects/:namespace';

export const workspaceRoutes = [
  {
    parentRoute: WORKSPACE_PATH,
    element: (
      <ModalProvider>
        <Outlet />
      </ModalProvider>
    ),
    children: [
      {
        path: `${WORKSPACE_PATH}/hpa-list`,
        element: <WorkSpaceHpaList />,
      },
      {
        path: `${PROJECT_PATH}`,
        element: <DetailLayout />,
        children: [
          {
            path: `${PROJECT_PATH}/hpa-detail/:name`,
            element: <WorkspaceHpaDetail />,
            handle: {
              menuName: 'hpa-list',
            },
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
