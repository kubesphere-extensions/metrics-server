import { SmcDuotone } from '@kubed/icons';
import { pick } from 'lodash';
import { default as React } from 'react';
import { HpaModal } from '../components/Hpa';
import { hasClusterModule } from '@ks-console/shared';

export const events = {
  // events
  __propsMap__: {
    'pageNav://pageNav.workspace.workloads.deployments-detail.metrics-server': (point: any) => {
      return {
        ...point,
        icon: <SmcDuotone size={40} />,
      };
    },
    'pageNav://pageNav.workspace.workloads.statefulsets-detail.metrics-server': (point: any) => {
      return {
        ...point,
        icon: <SmcDuotone size={40} />,
      };
    },
    'pageAction://pageAction.cluster.deployments.detail.metrics-server': (point: any) => {
      return {
        ...point,
        icon: <SmcDuotone size={40} />,
        show: () => {
          return hasClusterModule(point.detail.cluster, 'metrics-server');
        },
      };
    },
    'pageAction://pageAction.cluster.statefulsets.detail.metrics-server': (point: any) => {
      return {
        ...point,
        icon: <SmcDuotone size={40} />,
        show: () => {
          return hasClusterModule(point.detail.cluster, 'metrics-server');
        },
      };
    },
  },
  modal: {
    'pageNav://pageNav.workspace.workloads.deployments-detail.metrics-server': (
      modalDispatch: any,
      context: any,
    ) => {
      modalDispatch.show('open.workspace.hpa', {
        modal: HpaModal,
        detail: context.detail,
        params: pick(context.detail, ['name', 'cluster', 'namespace', 'workspace']),
        module: 'deployments',
      });
    },
    'pageNav://pageNav.workspace.workloads.statefulsets-detail.metrics-server': (
      modalDispatch: any,
      context: any,
    ) => {
      modalDispatch.show('open.workspace.hpa', {
        modal: HpaModal,
        detail: context.detail,
        params: pick(context.detail, ['name', 'cluster', 'namespace', 'workspace']),
        module: 'statefulsets',
      });
    },
    'pageAction://pageAction.cluster.deployments.detail.metrics-server': (
      modalDispatch: any,
      context: any,
    ) => {
      modalDispatch.show('open.cluster.hpa', {
        modal: HpaModal,
        detail: context.detail,
        params: pick(context.detail, ['name', 'cluster', 'namespace']),
        module: 'deployments',
      });
    },
    'pageAction://pageAction.cluster.statefulsets.detail.metrics-server': (
      modalDispatch: any,
      context: any,
    ) => {
      modalDispatch.show('open.cluster.hpa', {
        modal: HpaModal,
        detail: context.detail,
        params: pick(context.detail, ['name', 'cluster', 'namespace']),
        module: 'statefulsets',
      });
    },
  },
};
