import { SmcDuotone } from '@kubed/icons';
import { get, pick } from 'lodash';
import { default as React } from 'react';
import { HpaModal } from '../components/Hpa';
import { hasClusterModule } from '@ks-console/shared';

export const events = {
  // events
  __propsMap__: {
    'pageNav://pageNav.workspace.workloads.deployments-detail.metrics-server': (
      point: any,
      context: any,
    ) => {
      const kedaContext = get(
        context,
        'detail._originData.metadata.labels["keda.autoscaling.kubeshpere.io/managed"]',
      );

      const disabled = kedaContext === 'true' || kedaContext === true;
      return {
        ...point,
        disabled,
        show: hasClusterModule(context?.detail.cluster, 'metrics-server'),
        icon: <SmcDuotone size={40} />,
      };
    },
    'pageNav://pageNav.workspace.workloads.statefulsets-detail.metrics-server': (
      point: any,
      context: any,
    ) => {
      const kedaContext = get(
        context,
        'detail._originData.metadata.labels["keda.autoscaling.kubeshpere.io/managed"]',
      );
      const disabled = kedaContext === 'true' || kedaContext === true;
      return {
        ...point,
        disabled,
        show: hasClusterModule(context?.detail.cluster, 'metrics-server'),
        icon: <SmcDuotone size={40} />,
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
  },
};
