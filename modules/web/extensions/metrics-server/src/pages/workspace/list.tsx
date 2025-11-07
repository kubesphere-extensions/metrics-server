import {
  Avatar,
  defaultCheckboxColumn,
  getDisplayName,
  getLocalTime,
  tableState2Query,
  useBatchActions,
  useItemActions,
  useModalAction,
  useTableActions,
  BasePathParams,
  useUrlSearchParamsStatus,
  useWorkspaceProjectSelect,
  EventsSheet,
  IHpaDetail,
  PageLayout,
} from '@ks-console/shared';
import { Card, DataTable, Field } from '@kubed/components';
import { Pen, Trash, Role } from '@kubed/icons';
import { ColumnDef, Table } from '@tanstack/react-table';
import React from 'react';
import styled from 'styled-components';
import { HpaCreateModal } from '../../components/Modal/HpaCreateModal/HpaCreateModal';
import { HpaYamlModal } from '../../components/Modal/HpaYamlModal';
import { HpaStatus } from '../../components/HpaStatus/HpaStatus';
import { HpaEditModal } from '../../components/Modal/HpaEditModal/HpaEditModal';

import { formatCpuMetricValue, formatMemoryMetricValue } from '../../utils';
import { useHpaList } from '../../data/useHpaList';
import { useDelete } from '../../hooks/useDelete';
import { createHpaStore } from '../../stores/hpaStore';
import { useParams } from 'react-router-dom';
import { get } from 'lodash';
import { HpaScalerSettingModal } from '../../components/Modal/HpaScalerSettingModal/HpaScalerSettingModal';
import { HpaIcon } from '../../components/Icon/HpaIcon';
import { WORKLOAD_KIND_TEXT_MAP } from '../../constant';

const TableWrapper = styled.div`
  .table {
    width: 100%;
    .table-cell {
      word-break: break-word;
    }
  }
`;

interface RecordType {
  [key: string]: any;
}

const steps = [1, 4, 8, 16, 30];
const useSteps = (steps: number[]) => {
  const [stepIndex, setStepIndex] = React.useState(0);
  return {
    step: steps[stepIndex],
    nextStep: () => {
      if (stepIndex <= steps.length - 1) {
        setStepIndex(stepIndex + 1);
      }
    },
    reset: () => {
      setStepIndex(0);
    },
  };
};

export const WorkSpaceHpaList = () => {
  const { workspace } = useParams<BasePathParams>();
  const { state, setState } = useUrlSearchParamsStatus([]);
  const { params: namespaceParams, render: renderSelect } = useWorkspaceProjectSelect({
    workspace,
    showAll: false,
  });

  const useHpaStore = createHpaStore();

  const query = React.useMemo(() => {
    return {
      ...tableState2Query(state),
      ...namespaceParams,
    };
  }, [state, namespaceParams]);

  const { step, nextStep } = useSteps(steps);
  const { data, isLoading, isFetching, refetch } = useHpaList(query, {
    enabled: !!namespaceParams?.cluster && !!namespaceParams?.namespace,
    refetchInterval: step * 1000,
    onSettled: () => {
      nextStep();
    },
  });

  const { open, close } = useModalAction({
    modal: HpaEditModal,
    id: 'hpa-edit',
  });
  const { open: openCreate, close: closeCreate } = useModalAction({
    modal: HpaCreateModal,
    id: 'hpa-create',
  });
  const reset = useHpaStore(state => state.reset);
  const { open: openYaml, close: closeYaml } = useModalAction({
    modal: HpaYamlModal,
    id: 'hpa-yaml',
  });
  const { open: openEvents } = useModalAction({
    modal: EventsSheet,
    id: 'hpa-events',
  });
  const { open: openScaler, close: closeScaler } = useModalAction({
    modal: HpaScalerSettingModal,
    id: 'hpa-scalerSettings',
  });

  const tableRef = React.useRef<Table<RecordType>>();

  const { deleteHpa } = useDelete();

  const renderBatchActions = useBatchActions({
    authKey: '',
    params: {
      cluster: namespaceParams?.cluster,
      namespace: namespaceParams?.namespace,
    },
    actions: [
      {
        key: 'delete',
        text: t('hpa.common.delete'),
        action: 'delete',
        onClick: () => {
          const resource = tableRef.current?.getSelectedRowModel()?.rows.map(row => row.original!);
          deleteHpa({
            resource,
            type: 'hpa.title',
            onSuccess: () => {
              tableRef.current?.resetRowSelection();
              refetch();
            },
          });
        },
        props: {
          color: 'error',
        },
      },
    ],
  });

  const renderItemActions = useItemActions({
    authKey: '',
    params: {
      cluster: namespaceParams?.cluster,
      namespace: namespaceParams?.namespace,
    },
    actions: [
      {
        key: 'edit',
        action: 'edit',
        icon: <Pen />,
        text: t('hpa.common.editBaseInfo'),
        onClick: (_, record) => {
          open({
            onOk: () => {
              close();
              refetch();
            },
            onCancel: close,
            hpaDetail: record as IHpaDetail,
            params: { cluster: namespaceParams?.cluster, namespace: namespaceParams?.namespace },
          });
        },
      },
      {
        key: 'editYaml',
        action: 'edit',
        icon: <Pen />,
        text: t('hpa.common.editYaml'),
        onClick: (_, record) => {
          openYaml({
            hpaDetail: record as IHpaDetail,
            params: { cluster: namespaceParams?.cluster, namespace: namespaceParams?.namespace },
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
        action: 'edit',
        icon: <Pen />,
        text: t('hpa.common.editScalerSettings'),
        onClick: (_, record) => {
          openScaler({
            hpaDetail: record as IHpaDetail,
            params: { cluster: namespaceParams?.cluster, namespace: namespaceParams?.namespace },
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
        onClick: (_, record) => {
          deleteHpa({
            resource: record,
            type: 'hpa.title',
            onSuccess: () => {
              tableRef.current?.resetRowSelection();
              refetch();
            },
          });
        },
      },
    ],
  });

  const renderTableAction = useTableActions({
    authKey: '',
    params: {
      cluster: namespaceParams?.cluster,
      namespace: namespaceParams?.namespace,
    },
    actions: [
      {
        key: 'create',
        action: 'create',
        text: t('hpa.common.create'),
        props: {
          color: 'secondary',
          shadow: true,
        },
        disabled: !namespaceParams?.cluster || !namespaceParams?.namespace,
        onClick: e => {
          e.stopPropagation();
          e.preventDefault();
          openCreate({
            useHpaStore,
            extraParams: {
              cluster: namespaceParams?.cluster,
              name: '',
              workspace,
              namespace: namespaceParams?.namespace,
              kind: '',
            },
            onOk: () => {
              closeCreate();
              refetch();
            },
            onCancel: () => {
              reset();
              closeCreate();
            },
          });
        },
      },
    ],
  });

  const columns = React.useMemo<ColumnDef<RecordType, any>[]>(
    () => [
      defaultCheckboxColumn,
      {
        accessorKey: 'name',
        header: t('hpa.policyName'),
        meta: {
          searchKey: 'name',
          sortable: true,
        },
        cell: info => {
          return (
            <Avatar
              to={`/workspaces/${workspace}/clusters/${namespaceParams.cluster}/projects/${namespaceParams.namespace}/hpa-detail/${info.row.original.name}`}
              icon={<HpaIcon />}
              title={<a>{getDisplayName(info.row.original)}</a>}
              description={info.row.original.description}
            />
          );
        },
      },
      {
        accessorKey: 'status',
        header: t('hpa.common.status'),
        meta: {
          sortable: false,
          searchKey: 'status',
        },
        enableHiding: true,
        cell: info => (
          <HpaStatus
            onClick={() =>
              openEvents({ detail: info.row.original, headerTitle: t('hpa.common.viewEvents') })
            }
            status={info.row.original.status}
          />
        ),
      },
      {
        accessorKey: 'scaleTargetRef',
        header: t('hpa.scaleTarget'),
        enableHiding: true,
        cell: info => {
          const name = get(info.row.original, '_originData.spec.scaleTargetRef.name');
          const type = get(info.row.original, '_originData.spec.scaleTargetRef.kind');
          return (
            <Field
              label={t(WORKLOAD_KIND_TEXT_MAP[type as keyof typeof WORKLOAD_KIND_TEXT_MAP])}
              value={name}
            ></Field>
          );
        },
      },
      {
        accessorKey: 'cpuTargetUtilization',
        header: t('hpa.targetCPUUsage'),
        meta: {
          th: {
            width: '15%',
          },
        },
        enableHiding: true,
        cell: info => {
          const {
            cpuCurrentUtilization = 0,
            cpuTargetUtilization = 0,
            cpuTargetType,
          } = info.row.original;

          return (
            <Field
              value={formatCpuMetricValue(cpuTargetUtilization, cpuTargetType)}
              label={`${t('hpa.common.current')}：${formatCpuMetricValue(cpuCurrentUtilization, cpuTargetType)}`}
            />
          );
        },
      },
      {
        accessorKey: 'memoryTargetValue',
        header: t('hpa.targetMemoryUsage'),
        meta: {
          th: {
            width: '15%',
          },
        },
        enableHiding: true,
        cell: info => {
          const {
            memoryCurrentValue = 0,
            memoryTargetValue = 0,
            memoryTargetType,
          } = info.row.original;

          return (
            <Field
              value={formatMemoryMetricValue(memoryTargetValue, memoryTargetType)}
              label={`${t('hpa.common.current')}：${formatMemoryMetricValue(memoryCurrentValue, memoryTargetType)}`}
            />
          );
        },
      },
      {
        accessorKey: 'replicasRange',
        header: t('hpa.range'),
        meta: {
          th: {
            width: '10%',
          },
        },
        enableHiding: true,
        cell: info => {
          const minReplicas = get(info.row.original, 'minReplicas');
          const maxReplicas = get(info.row.original, 'maxReplicas');
          return `${minReplicas}-${maxReplicas}`;
        },
      },
      {
        accessorKey: 'desiredReplicas',
        header: t('hpa.desiredReplicas'),
        meta: {
          th: {
            width: '10%',
          },
        },
        enableHiding: true,
        cell: info => {
          const desiredReplicas = get(info.row.original, 'status.desiredReplicas');
          return desiredReplicas;
        },
      },
      {
        accessorKey: 'namespace',
        header: t('hpa.common.project'),
        enableHiding: true,
      },
      {
        accessorKey: 'createTime',
        header: t('hpa.common.creationTime'),
        meta: {
          sortable: true,
        },
        enableHiding: true,
        cell: info => {
          const time = info.getValue();
          if (!time) {
            return '-';
          }
          return getLocalTime(time).format('YYYY-MM-DD HH:mm:ss');
        },
      },
      {
        accessorKey: 'actions',
        header: '',
        meta: {
          th: {
            width: 100,
          },
        },
        cell: info => renderItemActions(info.getValue(), info.row.original),
      },
    ],
    [namespaceParams?.namespace],
  );

  const baseConfig = React.useState(() =>
    DataTable.getDefaultTableOptions<RecordType>({
      tableName: 'workspace-hpa-list',
      manual: true,
      enableVisible: true,
      enableSelection: true,
      enableMultiSelection: true,
    }),
  )[0];

  const table = DataTable.useTable<RecordType>({
    ...baseConfig,
    columns,
    loading: isLoading || isFetching,
    data: data?.data ?? [],
    rowCount: data?.total ?? 0,
    onParamsChange: setState,
    state,
    getRowId: React.useCallback((row: RecordType) => row.uid, []),
    meta: {
      ...baseConfig.meta,
      refetch,
      getProps: {
        table: () => {
          return {
            stickyHeader: true,
            tableWrapperClassName: 'table',
          };
        },
        toolbar: () => {
          return {
            toolbarLeft: renderSelect(),
            toolbarRight: renderTableAction(),
            batchActions: renderBatchActions(),
          };
        },
        filters: () => {
          return {
            simpleMode: false,
            suggestions: [
              {
                key: 'name',
                label: t('hpa.common.name'),
              },
            ],
          };
        },
        empty: () => {
          if (!namespaceParams.cluster || !namespaceParams.namespace) {
            return {
              image: <Role size={48} />,
              description: t('hpa.common.selectClusterOrProject'),
            };
          }
          return {
            image: <HpaIcon size={48} />,
            title: t('hpa.empty.title'),
            description: t('hpa.empty.description'),
          };
        },
      },
    },
  });

  React.useEffect(() => {
    tableRef.current = table;
  }, []);

  return (
    <PageLayout title={t('hpa.title')}>
      <Card padding={0}>
        <TableWrapper>
          <DataTable.DataTable table={table} />
        </TableWrapper>
      </Card>
    </PageLayout>
  );
};
