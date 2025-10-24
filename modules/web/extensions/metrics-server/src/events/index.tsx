import { get, pick } from 'lodash';
import React from 'react';
import { HpaModal } from '../components/WorkloadSheet';
import { hasClusterModule } from '@ks-console/shared';
import { HpaIcon } from '../components/Icon/HpaIcon';
import { Tooltip } from '@kubed/components';

export const events = {
  // events
  __propsMap__: {
    'pageNav://pageNav.workspace.workloads.deployments-detail.metrics-server': (
      point: any,
      context: any,
    ) => {
      const kedaContext = get(
        context,
        'detail._originData.metadata.labels["keda.autoscaling.kubesphere.io/managed"]',
      );

      const disabled = kedaContext === 'true' || kedaContext === true;
      return {
        ...point,
        disabled,
        show: hasClusterModule(context?.detail.cluster, 'metrics-server'),
        icon: <HpaIcon size={40} />,
      };
    },
    'pageNav://pageNav.workspace.workloads.statefulsets-detail.metrics-server': (
      point: any,
      context: any,
    ) => {
      const kedaContext = get(
        context,
        'detail._originData.metadata.labels["keda.autoscaling.kubesphere.io/managed"]',
      );
      const disabled = kedaContext === 'true' || kedaContext === true;
      return {
        ...point,
        disabled,
        show: hasClusterModule(context?.detail.cluster, 'metrics-server'),
        icon: <HpaIcon size={40} />,
      };
    },
    'pageNav://pageNav.cluster.deployments.detail.metrics-server': (point: any, context: any) => {
      const kedaContext = get(
        context,
        'detail._originData.metadata.labels["keda.autoscaling.kubesphere.io/managed"]',
      );
      const disabled = kedaContext === 'true' || kedaContext === true;
      return {
        ...point,
        disabled,
        show: hasClusterModule(context?.detail.cluster, 'metrics-server'),
        icon: <HpaIcon size={40} />,
      };
    },
    'pageNav://pageNav.cluster.statefulsets.detail.metrics-server': (point: any, context: any) => {
      const kedaContext = get(
        context,
        'detail._originData.metadata.labels["keda.autoscaling.kubesphere.io/managed"]',
      );
      const disabled = kedaContext === 'true' || kedaContext === true;
      return {
        ...point,
        disabled,
        show: hasClusterModule(context?.detail.cluster, 'metrics-server'),
        icon: <HpaIcon size={40} />,
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
    'pageNav://pageNav.cluster.deployments.detail.metrics-server': (
      modalDispatch: any,
      context: any,
    ) => {
      modalDispatch.show('open.cluster.hpa', {
        modal: HpaModal,
        detail: context.detail,
        params: pick(context.detail, ['name', 'cluster', 'namespace', 'workspace']),
        module: 'deployments',
      });
    },
  },
  'pageNav://pageNav.cluster.statefulsets.detail.metrics-server': (
    modalDispatch: any,
    context: any,
  ) => {
    modalDispatch.show('open.cluster.hpa', {
      modal: HpaModal,
      detail: context.detail,
      params: pick(context.detail, ['name', 'cluster', 'namespace', 'workspace']),
      module: 'statefulsets',
    });
  },
};
