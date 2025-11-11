import React from 'react';
import {
  ClusterAliasName,
  ProjectAliasName,
  getAnnotationsName,
  formatTime,
  getDisplayName,
  useCacheStore as useStore,
  useModalAction,
  EventsSheet,
} from '@ks-console/shared';
import { useNavigate } from 'react-router-dom';
import { useHpaDetail } from '../../data/useHpaDetail';
import { isEmpty, get } from 'lodash';
import { useParams } from 'react-router-dom';
import { HpaStatus } from '../../components/HpaStatus/HpaStatus';
import { Pen, Trash } from '@kubed/icons';
import { DetailPage } from '../../components/DetailPage/DetailPage';
import { HpaEditModal } from '../../components/Modal/HpaEditModal/HpaEditModal';
import { HpaYamlModal } from '../../components/Modal/HpaYamlModal';
import { useDelete } from '../../hooks/useDelete';
import { HpaScalerSettingModal } from '../../components/Modal/HpaScalerSettingModal/HpaScalerSettingModal';
import { HpaIcon } from '../../components/Icon/HpaIcon';
import { AUTH_KEY } from '../../constant';
const ClusterHpaDetail = () => {
  const navigate = useNavigate();
  const { cluster, namespace, name } = useParams();
  const [detail, setDetail] = useStore<any>('hpaDetail');
  const { refetch } = useHpaDetail(
    {
      cluster,
      namespace,
      name,
    },
    {
      onSuccess: (detail: any) => {
        setDetail(detail);
      },
      enabled: !!cluster && !!namespace && !!name,
    },
  );
  const tabs = [
    {
      path: `resource-status`,
      title: t('hpa.common.resourceStatus'),
    },
    {
      path: `events`,
      title: t('hpa.common.events'),
    },
  ];
  function getAttrs(): any {
    if (isEmpty(detail)) {
      return;
    }

    return [
      {
        label: t('hpa.common.status'),
        value: (
          <HpaStatus
            onClick={() => openEvents({ detail, headerTitle: t('hpa.common.viewEvents') })}
            status={detail.status}
          />
        ),
      },
      {
        label: t('hpa.common.cluster'),
        value: <ClusterAliasName cluster={cluster} />,
      },
      {
        label: t('hpa.common.project'),
        value: <ProjectAliasName project={namespace} />,
      },
      {
        label: t('hpa.common.creationTime'),
        value: formatTime(get(detail, 'metadata.creationTimestamp'), 'YYYY-MM-DD HH:mm:ss'),
      },
      {
        label: t('hpa.common.creator'),
        value: getAnnotationsName(detail, 'kubesphere.io/creator'),
      },
    ];
  }
  const { open: openEvents } = useModalAction({
    modal: EventsSheet,
    id: 'hpa-events',
  });
  const { open, close } = useModalAction({
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
  const actions = [
    {
      key: 'edit',
      action: 'edit',
      icon: <Pen />,
      text: t('hpa.common.editBaseInfo'),
      onClick: () => {
        open({
          onOk: () => {
            close();
            refetch();
          },
          onCancel: close,
          hpaDetail: detail,
          params: { cluster, namespace },
        });
      },
    },
    {
      key: 'editYaml',
      icon: <Pen />,
      text: t('hpa.common.editYaml'),
      action: 'edit',
      onClick: () => {
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
      key: 'editScalerSettings',
      icon: <Pen />,
      text: t('hpa.common.editScalerSettings'),
      action: 'edit',
      onClick: () => {
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
      onClick: () => {
        deleteHpa({
          resource: detail,
          type: 'hpa.title',
          onSuccess: () => {
            navigate(`/clusters/${cluster}/hpa-list`);
          },
        });
      },
    },
  ];
  return (
    <>
      <DetailPage
        authKey={AUTH_KEY}
        tabs={tabs}
        cardProps={{
          name: getDisplayName(detail),
          desc: detail?.description,
          icon: <HpaIcon />,
          attrs: getAttrs(),
          actions,
          params: { cluster, namespace },
          actionOptions: { theme: 'dark' },
          breadcrumbs: {
            label: t('hpa.title'),
            url: `/clusters/${cluster}/hpa-list`,
          },
        }}
      />
    </>
  );
};

export { ClusterHpaDetail };
