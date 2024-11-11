import { Pen, Stretch, SmcDuotone } from '@kubed/icons';
import { pick } from 'lodash';
import { default as React } from 'react';
import { HpaModal } from '../components/Hpa';

export const events = {
  // events
  __propsMap__: {
    'pageNav://pageNav.workspace.workloads.deployments-detail.metrics-server': (
      point: any,
      context: any,
    ) => {
      return {
        ...point,
        icon: <Stretch size={40} />,
      };
    },
    'pageNav://pageNav.workspace.workloads.statefulsets-detail.metrics-server': (
      point: any,
      context: any,
    ) => {
      return {
        ...point,
        icon: <Stretch size={40} />,
      };
    },
    'pageAction://pageAction.cluster.deployments.detail.metrics-server': (
      point: any,
      context: any,
    ) => {
      return {
        ...point,
        icon: <SmcDuotone size={40} />,
      };
    },
  },
  modal: {
    'pageNav://pageNav.workspace.workloads.deployments-detail.metrics-server': (
      modalDispatch: any,
      context: any,
    ) => {
      console.log('context', context);

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
  },
};
