import {
  BasePathParams,
  ClusterAliasName,
  Events,
  EventsSheet,
  formatTime,
  ProjectAliasName,
  useModalAction,
  useCacheStore,
  getDisplayName,
} from '@ks-console/shared';
import { Loading } from '@kubed/components';
import { Pen, Trash } from '@kubed/icons';
import * as React from 'react';
import { ResourceStatus } from '../ResourceStatus/ResourceStatus';
import { useHpaDetail } from '../../data/useHpaDetail';
import { DetailPage } from '../DetailPage/DetailPage';
import { HpaStatus } from '../HpaStatus/HpaStatus';
import { HpaYamlModal } from '../Modal/HpaYamlModal';
import { HpaEditModal } from '../Modal/HpaEditModal/HpaEditModal';
import { useDelete } from '../../hooks/useDelete';
import { HpaScalerSettingModal } from '../Modal/HpaScalerSettingModal/HpaScalerSettingModal';
import { HpaIcon } from '../Icon/HpaIcon';
import { AUTH_KEY } from '../../constant';

interface WorkloadHpaDetailProps {
  params?: BasePathParams;
  backTo?: () => void;
}

export const WorkloadHpaDetail = (props: WorkloadHpaDetailProps) => {
  const { params = {}, backTo } = props;
  const { cluster, namespace, name, workspace } = params;
  const { isLoading, refetch } = useHpaDetail(
    {
      cluster,
      namespace,
      name,
    },
    {
      enable: !!cluster && !!namespace && !!name,
      onSuccess: (detail: any) => {
        setDetail(detail);
      },
    },
  );
  const [detail, setDetail] = useCacheStore('hpaDetail');

  const { open } = useModalAction({
    modal: EventsSheet,
    id: 'hpa-events',
  });

  const { open: openEdit, close: closeEdit } = useModalAction({
    modal: HpaEditModal,
    id: 'hpa-edit',
  });
  const { open: openYaml, close: closeYaml } = useModalAction({
    modal: HpaYamlModal,
    id: 'hpa-yaml',
  });
  const { open: openScaler, close: closeScaler } = useModalAction({
    modal: HpaScalerSettingModal,
    id: 'hpa-scalerSettings',
  });
  const { deleteHpa } = useDelete();

  const sideProps = React.useMemo(() => {
    const base = {
      name: getDisplayName(detail),
      desc: detail?.description,
      icon: <HpaIcon />,
      breadcrumbs: {
        label: t('hpa.title'),
        onClick: backTo,
      },
    };
    if (!detail) {
      return base;
    }
    const attrs = [
      {
        label: t('hpa.common.status'),
        value: (
          <HpaStatus
            ready={detail?.metadata?.annotations?.['hpa.autoscaling.kubesphere.io/ready']}
            status={detail?.status}
            onClick={() => {
              open({ detail, headerTitle: t('hpa.title') });
            }}
          ></HpaStatus>
        ),
      },
      {
        label: t('hpa.common.cluster'),
        value: <ClusterAliasName cluster={params.cluster} />,
      },
      {
        label: t('hpa.common.project'),
        value: <ProjectAliasName project={params.namespace} />,
      },
      {
        label: t('hpa.common.creationTime'),
        value: detail?.metadata?.creationTimestamp
          ? formatTime(detail.metadata.creationTimestamp)
          : '',
      },
      {
        label: t('hpa.common.creator'),
        value: detail?.metadata.annotations?.['kubesphere.io/creator'],
      },
    ];
    const actions: any[] = [
      {
        key: 'edit',
        action: 'edit',
        icon: <Pen />,
        text: t('hpa.common.editBaseInfo'),
        onClick: (_: any) => {
          openEdit({
            hpaDetail: detail,
            params: { cluster, namespace },
            onOk: () => {
              closeEdit();
              refetch();
            },
            onCancel: closeEdit,
          });
        },
      },
      {
        key: 'editYaml',
        action: 'edit',
        icon: <Pen />,
        text: t('hpa.common.editYaml'),
        onClick: (_: any) => {
          openYaml({
            hpaDetail: detail,
            params: { cluster, namespace },
            onOk: () => {
              closeYaml();
              refetch();
            },
            onCancel: closeYaml,
          });
        },
      },
      {
        key: 'editScale',
        action: 'edit',
        icon: <Pen />,
        text: t('hpa.common.editScalerSettings'),
        onClick: (_: any) => {
          openScaler({
            hpaDetail: detail,
            params: { cluster, namespace },
            onOk: () => {
              closeScaler();
              refetch();
            },
            onCancel: closeScaler,
          });
        },
      },
      {
        key: 'delete',
        action: 'delete',
        icon: <Trash />,
        text: t('hpa.common.delete'),
        onClick: (_: any) => {
          deleteHpa({
            resource: detail,
            type: 'hpa.title',
            onSuccess: () => {
              backTo?.();
            },
          });
        },
      },
    ];

    return {
      ...base,
      attrs,
      actions,
      labels: detail.labels,
      extra: detail.annotations,
    };
  }, [detail]);

  const [nav, setNav] = React.useState('resource-status');
  if (isLoading) {
    return <Loading className="page-loading" />;
  }

  return (
    <>
      <DetailPage
        cardProps={sideProps as unknown as any}
        tabs={[
          {
            path: `resource-status`,
            title: t('hpa.common.resourceStatus'),
            onClick: () => {
              setNav('resource-status');
            },
          },
          {
            path: 'events',
            title: t('hpa.common.events'),
            onClick: () => {
              setNav('events');
            },
          },
        ]}
        params={{ cluster, namespace, workspace }}
        activeTab={nav}
        detail={detail}
        authKey={AUTH_KEY}
      />
      {nav === 'resource-status' && <ResourceStatus />}
      {nav === 'events' && <Events detail={detail} module="hpa" />}
    </>
  );
};
