import React from 'react';
import {
  PercentBarChartDuotone,
  Stretch,
  Down3Duotone,
  Up3Duotone,
  Cpu,
  Memory,
  Backup,
} from '@kubed/icons';
import { Card } from '@kubed/components';
import {
  Avatar,
  ReplicaCard,
  useCacheStore as useStore,
  deploymentStore,
} from '@ks-console/shared';
import { StatusWrapper, CardItem, ScaleCard } from './styles';
import { Icon } from '@ks-console/shared';
import {
  STATUS_TITLE,
  STATUS_DESCRIPTION,
  ICON_TYPES,
  WORKLOAD_KIND_MAP,
  WORKLOAD_KIND_TEXT_MAP,
} from '../../constant';
import { get } from 'lodash';
import {
  findTargetMetric,
  getTargetMetricValue,
  getCurrentMetricValue,
  formatCpuMetricValue,
  formatMemoryMetricValue,
  type MetricTargetType,
} from '../../utils';
import { CopyWarningDuotone } from '@kubed/icons';

const STATUS_ICON = {
  AbleToScale: <Stretch size={40} />,
  ScalingActive: <PercentBarChartDuotone size={40} />,
  ScalingLimited: <CopyWarningDuotone size={40} />,
};

const ResourceStatus = () => {
  const [detail] = useStore<any>('hpaDetail');
  const workloadModule =
    WORKLOAD_KIND_MAP[
      get(detail, 'spec.scaleTargetRef.kind', '') as keyof typeof WORKLOAD_KIND_MAP
    ];
  const workloadName = get(detail, 'spec.scaleTargetRef.name', '');
  const store = deploymentStore(workloadModule);

  const { status, cluster, namespace } = detail ?? {};
  const { data: workloadDetail } = store.useQueryDetail<any>(
    {
      cluster,
      name: workloadName,
      namespace,
    },
    {
      watch: true,
      enabled: !!cluster && !!namespace && !!workloadName,
    },
  );
  const conditions = status?.conditions ?? [];
  const finalConditions = conditions.map((item: any) => ({
    ...item,
    statusForShow:
      item.type === 'ScalingLimited'
        ? item.status === 'Unknown'
          ? item.status
          : item.status === 'True'
            ? 'False'
            : 'True'
        : item.status,
  }));
  // CPU metrics: Use utility functions to get target and current values
  const cpuTargetValue = getTargetMetricValue(detail?.spec?.metrics, 'cpu');
  const cpuCurrentValue = getCurrentMetricValue(
    detail?.status?.currentMetrics,
    detail?.spec?.metrics,
    'cpu',
  );
  const cpuTargetType: MetricTargetType =
    (findTargetMetric(detail?.spec?.metrics, 'cpu')?.target?.type as MetricTargetType) || '';

  // Memory metrics: Use utility functions to get target and current values
  const memoryTargetValue = getTargetMetricValue(detail?.spec?.metrics, 'memory');
  const memoryCurrentValue = getCurrentMetricValue(
    detail?.status?.currentMetrics,
    detail?.spec?.metrics,
    'memory',
  );
  const memoryTargetType: MetricTargetType =
    (findTargetMetric(detail?.spec?.metrics, 'memory')?.target?.type as MetricTargetType) || '';

  return (
    <div>
      <Card sectionTitle={t('hpa.common.statusInformation')}>
        <StatusWrapper>
          {finalConditions.map((item: any) => (
            <CardItem key={item.type}>
              <Avatar
                icon={
                  <div style={{ width: 40, height: 40, position: 'relative' }}>
                    {STATUS_ICON[item.type as keyof typeof STATUS_ICON]}
                    <Icon
                      name={ICON_TYPES[item.statusForShow as keyof typeof ICON_TYPES].name}
                      size={16}
                      color="#fff"
                      style={{
                        fill: ICON_TYPES[item.statusForShow as keyof typeof ICON_TYPES].color,
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                      }}
                    />
                  </div>
                }
                title={t(STATUS_TITLE[item.type as keyof typeof STATUS_TITLE])}
                description={t(STATUS_DESCRIPTION[item.type as keyof typeof STATUS_DESCRIPTION])}
              />
            </CardItem>
          ))}
        </StatusWrapper>
      </Card>
      <Card sectionTitle={t('hpa.scaleTarget')}>
        <Avatar
          icon={<Backup size={40}></Backup>}
          title={get(detail, 'spec.scaleTargetRef.name', '')}
          description={t(
            WORKLOAD_KIND_TEXT_MAP[
              get(detail, 'spec.scaleTargetRef.kind', '') as keyof typeof WORKLOAD_KIND_TEXT_MAP
            ],
          )}
        ></Avatar>
        <ScaleCard>
          <ReplicaCard
            className="replica-card"
            module={workloadModule}
            theme="dark"
            chartSize={90}
            detail={workloadDetail}
            enableScale={false}
          />
          <div
            style={{
              flex: 1,
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gridTemplateRows: '1fr 1fr',
              gap: 12,
            }}
          >
            <CardItem>
              <Avatar
                icon={<Down3Duotone size={40} />}
                description={t('hpa.minimumReplicas')}
                title={get(detail, 'spec.minReplicas', '')}
              ></Avatar>
            </CardItem>
            <CardItem>
              <Avatar
                icon={<Up3Duotone size={40} />}
                description={t('hpa.maximumReplicas')}
                title={get(detail, 'spec.maxReplicas', '')}
              ></Avatar>
            </CardItem>
            <CardItem>
              <Avatar
                icon={<Cpu size={40} />}
                title={`${formatCpuMetricValue(cpuTargetValue, cpuTargetType)} (${t('hpa.common.current')}: ${formatCpuMetricValue(cpuCurrentValue, cpuTargetType)})`}
                description={t('hpa.targetCPUUsage')}
              ></Avatar>
            </CardItem>
            <CardItem>
              <Avatar
                icon={<Memory size={40} />}
                title={`${formatMemoryMetricValue(memoryTargetValue, memoryTargetType)} (${t('hpa.common.current')}: ${formatMemoryMetricValue(memoryCurrentValue, memoryTargetType)})`}
                description={t('hpa.targetMemoryUsage')}
              ></Avatar>
            </CardItem>
          </div>
        </ScaleCard>
      </Card>
    </div>
  );
};

export { ResourceStatus };
