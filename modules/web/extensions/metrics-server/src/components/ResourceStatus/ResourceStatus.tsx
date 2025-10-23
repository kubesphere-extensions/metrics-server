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
  workloadStore,
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
import { findCurrentMetric, findTargetMetric, quantityToMi } from '../../utils';
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
  const cpuTarget = findTargetMetric(detail?.spec?.metrics, 'cpu')?.target;
  const cpuTargetValue = cpuTarget?.averageUtilization || cpuTarget?.averageValue;
  const cpuCurrent = findCurrentMetric(detail?.status?.currentMetrics, 'cpu');
  const cpuCurrentValue = cpuCurrent?.averageUtilization || cpuCurrent?.averageValue;

  const memoryTarget = findTargetMetric(detail?.spec?.metrics, 'memory')?.target;
  const memoryTargetValue =
    memoryTarget?.averageUtilization || quantityToMi(memoryTarget?.averageValue);

  const memoryCurrent = findCurrentMetric(detail?.status?.currentMetrics, 'memory');
  const memoryCurrentValue =
    memoryCurrent?.averageUtilization || quantityToMi(memoryCurrent?.averageValue);

  const memoryValueFormat = (value: number | Record<string, any>) => {
    if (!value) return '-';
    if (typeof value === 'number') {
      return value + '%';
    }
    return value.stringValue;
  };

  const cpuValueFormat = (value: number | string | undefined) => {
    if (!value) return '-';
    if (typeof value === 'number') {
      return value + '%';
    }
    return value;
  };

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
                title={`${cpuValueFormat(cpuTargetValue)} (${t('hpa.common.current')}: ${cpuValueFormat(cpuCurrentValue)})`}
                description={t('hpa.targetCPUUsage')}
              ></Avatar>
            </CardItem>
            <CardItem>
              <Avatar
                icon={<Memory size={40} />}
                title={`${memoryValueFormat(memoryTargetValue)} (${t('hpa.common.current')}: ${memoryValueFormat(memoryCurrentValue)})`}
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
