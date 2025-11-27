import * as React from 'react';
import {
  defaultCheckboxColumn,
  getLocalTime,
  PageLayout,
  tableState2Query,
  useBatchActions,
  useItemActions,
  useTableActions,
  useUrlSearchParamsStatus,
  Avatar,
  getDisplayName,
  useModalAction,
  EventsSheet,
  IHpaDetail,
} from '@ks-console/shared';
import { Card, DataTable, Field } from '@kubed/components';
import { ColumnDef, Table } from '@tanstack/react-table';
import { Pen, Trash } from '@kubed/icons';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';
import { useHpaList } from '../../data/useHpaList';
import { get } from 'lodash';
import { useProjectSelect } from '../../hooks/useProjectSelect';
import { HpaStatus } from '../../components/HpaStatus/HpaStatus';
import { formatCpuMetricValue, formatMemoryMetricValue } from '../../utils';
import { HpaCreateModal } from '../../components/Modal/HpaCreateModal/HpaCreateModal';
import { createHpaStore } from '../../stores/hpaStore';
import { HpaEditModal } from '../../components/Modal/HpaEditModal/HpaEditModal';
import { HpaYamlModal } from '../../components/Modal/HpaYamlModal';
import { useDelete } from '../../hooks/useDelete';
import { HpaScalerSettingModal } from '../../components/Modal/HpaScalerSettingModal/HpaScalerSettingModal';
import { HpaIcon } from '../../components/Icon/HpaIcon';
import { WORKLOAD_KIND_TEXT_MAP, AUTH_KEY, HPA_STATUS_FILTERS } from '../../constant';
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

const ClusterHpaList = () => {
  const useHpaStore = createHpaStore();
  const { cluster } = useParams();
  const tableRef = React.useRef<Table<RecordType>>();
  const { state, setState } = useUrlSearchParamsStatus([]);
  const { render: renderProjectSelect, params } = useProjectSelect();
  const { namespace } = params ?? {};

  const { step, nextStep } = useSteps(steps);
  const query = React.useMemo(() => {
    return {
      ...tableState2Query(state),
      namespace,
      cluster,
    };
  }, [state, namespace, cluster]);
  const { data, isLoading, isFetching, isFetched, refetch } = useHpaList(query, {
    enabled: true,
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

  const { deleteHpa } = useDelete();

  const renderItemActions = useItemActions({
    authKey: AUTH_KEY,
    params: {
      cluster,
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
            params: { cluster, namespace: record.namespace },
          });
        },
      },
      {
        key: 'editYaml',
        icon: <Pen />,
        text: t('hpa.common.editYaml'),
        action: 'edit',
        onClick: (_, record) => {
          openYaml({
            hpaDetail: record as IHpaDetail,
            params: { cluster, namespace: record.namespace },
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
        onClick: (_, record) => {
          openScaler({
            hpaDetail: record as IHpaDetail,
            params: { cluster, namespace: record.namespace },
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
              refetch();
            },
          });
        },
      },
    ],
  });

  const columns: ColumnDef<RecordType, any>[] = [
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
            to={`/clusters/${cluster}/projects/${info.row.original.namespace}/hpa-detail/${info.row.original.name}/resource-status`}
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
        const { cpuCurrentUtilization, cpuTargetUtilization, cpuTargetType } = info.row.original;

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
        const { memoryCurrentValue, memoryTargetValue, memoryTargetType } = info.row.original;

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
  ];

  const renderBatchActions = useBatchActions({
    authKey: AUTH_KEY,
    params: {
      cluster,
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

  const renderTableActions = useTableActions({
    authKey: AUTH_KEY,
    params: {
      cluster,
    },
    actions: [
      {
        key: 'create',
        text: t('hpa.common.create'),
        action: 'create',
        onClick: () => {
          openCreate({
            useHpaStore,
            extraParams: {
              cluster,
              name: '',
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
        props: {
          color: 'secondary',
          shadow: true,
        },
      },
    ],
  });

  const baseConfig = React.useState(() =>
    DataTable.getDefaultTableOptions<RecordType>({
      tableName: 'workload-template-list',
      manual: true,
      enableVisible: true,
      enableSelection: true,
      enableMultiSelection: true,
    }),
  )[0];

  const table = DataTable.useTable<RecordType>({
    ...baseConfig,
    columns,
    loading: isLoading || isFetching || !cluster,
    data: data?.data ?? [],
    rowCount: data?.total ?? 0,
    onParamsChange: setState,
    state,
    getRowId: React.useCallback(row => row.uid, []),
    meta: {
      ...baseConfig.meta,
      refetch: refetch,
      getProps: {
        table: () => ({
          stickyHeader: true,
          tableWrapperClassName: 'table',
        }),
        toolbar: () => ({
          toolbarLeft: renderProjectSelect(),
          toolbarRight: renderTableActions(),
          batchActions: renderBatchActions(),
        }),
        filters: () => ({
          simpleMode: false,
          suggestions: [
            {
              key: 'name',
              label: t('hpa.common.name'),
            },
            {
              key: 'fieldSelector',
              label: t('hpa.common.status'),
              options: HPA_STATUS_FILTERS.map(s => ({
                label: t(s.label),
                key: s.value,
              })),
            },
          ],
        }),
        empty: () => {
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
    <>
      <PageLayout title={t('hpa.title')}>
        <Card padding={0}>
          <TableWrapper>
            <DataTable.DataTable table={table} />
          </TableWrapper>
        </Card>
      </PageLayout>
    </>
  );
};

export { ClusterHpaList };
