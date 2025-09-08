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
import { Avatar, ReplicaCard, useCacheStore as useStore } from '@ks-console/shared';
import { StatusWrapper, CardItem, ScaleCard } from './styles';
import { Icon } from '@ks-console/shared';
import { STATUS_TITLE, STATUS_DESCRIPTION, ICON_TYPES, WORKLOAD_KIND_MAP } from '../../constant';
import { get } from 'lodash';
import { findTargetMetric } from '../../utils';

const STATUS_ICON = {
  AbleToScale: <Stretch size={40} />,
  ScalingActive: <PercentBarChartDuotone size={40} />,
  ScalingLimited: <Stretch size={40} />,
};

const ResourceStatus = () => {
  const [detail] = useStore<any>('hpaDetail');
  const { status } = detail ?? {};
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
  return (
    <div>
      <Card sectionTitle="状态信息">
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
                title={STATUS_TITLE[item.type as keyof typeof STATUS_TITLE]}
                description={STATUS_DESCRIPTION[item.type as keyof typeof STATUS_DESCRIPTION]}
              />
            </CardItem>
          ))}
        </StatusWrapper>
      </Card>
      <Card sectionTitle="伸缩对象">
        <Avatar
          icon={<Backup size={40}></Backup>}
          title={get(detail, 'spec.scaleTargetRef.name', '')}
          description={get(detail, 'spec.scaleTargetRef.kind', '')}
        ></Avatar>
        <ScaleCard>
          <ReplicaCard
            className="replica-card"
            module={
              WORKLOAD_KIND_MAP[
                get(detail, 'spec.scaleTargetRef.kind', '') as keyof typeof WORKLOAD_KIND_MAP
              ]
            }
            theme="dark"
            chartSize={90}
            detail={detail}
            enableScale={false}
          />
          <div
            className="xxxx"
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
                title="最小副本数"
                description={get(detail, 'spec.minReplicas', '')}
              ></Avatar>
            </CardItem>
            <CardItem>
              <Avatar
                icon={<Up3Duotone size={40} />}
                title="最大副本数"
                description={get(detail, 'spec.maxReplicas', '')}
              ></Avatar>
            </CardItem>
            <CardItem>
              <Avatar
                icon={<Cpu size={40} />}
                title="目标CPU使用率"
                description={
                  findTargetMetric(detail?.spec?.metrics, 'cpu')?.target?.averageUtilization ?? ''
                }
              ></Avatar>
            </CardItem>
            <CardItem>
              <Avatar
                icon={<Memory size={40} />}
                title="目标内存使用率"
                description={
                  findTargetMetric(detail?.spec?.metrics, 'memory')?.target?.averageValue ?? ''
                }
              ></Avatar>
            </CardItem>
          </div>
        </ScaleCard>
      </Card>
    </div>
  );
};

export { ResourceStatus };
