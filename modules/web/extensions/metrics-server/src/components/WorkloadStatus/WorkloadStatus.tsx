/*
 * Please refer to the LICENSE file in the root directory of the project.
 * https://github.com/kubesphere/console/blob/master/LICENSE
 */

import React from 'react';
import { Stretch, TimedTask } from '@kubed/icons';
import { getWorkloadStatus, StatusIndicator } from '@ks-console/shared';
import { get } from 'lodash';
import { Tooltip } from '@kubed/components';
import styled from 'styled-components';

const Flex = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;
export interface WorkloadStatusProps {
  workloadItem: any;
  module: string;
}

export const S2I_STATUS_DESC: Record<string, string> = {
  Failed: 'IMAGE_BUILDING_FAILED',
  Running: 'BUILDING_IMAGE',
  Successful: 'IMAGE_BUILDING_SUCCESSFUL',
};

const WorkloadStatus = ({ workloadItem, module }: WorkloadStatusProps) => {
  const { status } = getWorkloadStatus(workloadItem, module) || '';

  if (status.startsWith('S2I')) {
    const S2iStatus: string = status.slice(4);

    return (
      <StatusIndicator type={S2iStatus as any}>{t(S2I_STATUS_DESC[S2iStatus])}</StatusIndicator>
    );
  }

  if (module === 'daemonsets') {
    const ready = get(workloadItem, 'status.numberAvailable', 0);
    const total = get(workloadItem, 'status.desiredNumberScheduled', 0);

    return (
      <StatusIndicator type={status as any} ready={ready} total={total}>
        {t(status.toUpperCase())}
      </StatusIndicator>
    );
  }

  return (
    <Flex>
      <StatusIndicator
        type={status as any}
        ready={workloadItem.readyPodNums}
        total={workloadItem.podNums}
      >
        {t(status.toUpperCase())}
      </StatusIndicator>
      {get(workloadItem, 'labels["hpa.autoscaling.kubeshpere.io/managed"]', 'false') === 'true' && (
        <Tooltip content={t('hpa.hpaSetTip')}>
          <TimedTask />
        </Tooltip>
      )}
      {get(workloadItem, 'labels["keda.autoscaling.kubeshpere.io/managed"]', 'false') ===
        'true' && (
        <Tooltip content={t('hpa.customScalingSetTip')}>
          <Stretch size={20} />
        </Tooltip>
      )}
      {get(workloadItem, 'labels["vpa.autoscaling.kubeshpere.io/managed"]', 'false') === 'true' && (
        <Tooltip content={t('hpa.vpaSetTip')}>
          <Stretch size={20} />
        </Tooltip>
      )}
    </Flex>
  );
};

export { WorkloadStatus };
