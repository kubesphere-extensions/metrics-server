import {
  Avatar,
  defaultCheckboxColumn,
  getDisplayName,
  getLocalTime,
  IHpaDetail,
  joinSelector,
  ProjectAliasName,
  tableState2Query,
  useBatchActions,
  useItemActions,
  useModalAction,
  useTableActions,
} from '@ks-console/shared';
import { Card, DataTable, Field, notify } from '@kubed/components';
import { Pen, Trash, SmcDuotone } from '@kubed/icons';
import { ColumnDef, Table } from '@tanstack/react-table';
import * as React from 'react';
import styled from 'styled-components';
import { Empty } from '../../Empty/Empty';
import { HpaCreateModal } from '../HpaCreateModal/HpaCreateModal';
import { HpaStatus } from '../HpaStatus/HpaStatus';
import { HpaEditModal } from '../HpaEditModal/HpaEditModal';
import { quantityToMi } from '../../../utils';
import { useHpaList } from '../../../data/useHpaList';
import { useDelete } from '../../../hooks/useDelete';
import { useEditYaml } from '../../../hooks/useEditYaml';

const Container = styled.div`
  table .table-cell {
    word-break: break-word;
  }
`;

interface HpaTableProps {
  cluster?: string;
  workspace?: string;
  namespace?: string;
  kind?: string;
  name?: string;
  apiVersion?: string;
  onCreate?: () => void;
  detail?: RecordType;
  workloadStore?: any;
  module?: string;
}

interface Query {
  cluster?: string;
  namespace?: string;
  [key: string]: string | number | boolean | undefined;
}

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

export const HpaTable = (props: HpaTableProps) => {
  const { cluster, workspace, namespace, kind, name, detail, workloadStore, module } = props;

  const [state, setState] = React.useState<Record<string, any>>({});

  const query: Query = React.useMemo(() => {
    return {
      cluster,
      namespace,
      labelSelector: joinSelector({
        'autoscaling.kubeshpere.io/scale-target-kind': kind,
        'autoscaling.kubeshpere.io/scale-target-name': name,
      }),
      ...tableState2Query(state),
    };
  }, [state, cluster, namespace, kind, name]);

  const { step, nextStep } = useSteps(steps);
  const { data, isLoading, isFetching, isFetched, refetch } = useHpaList(query, {
    enabled: !!cluster && !!namespace && !!kind && !!name,
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

  const tableRef = React.useRef<Table<RecordType>>();

  const { editYaml } = useEditYaml({
    cluster,
    namespace,
  });
  const { deleteHpa } = useDelete({
    cluster,
    namespace,
  });

  const renderBatchActions = useBatchActions({
    authKey: module,
    params: {
      cluster,
      namespace,
    },
    actions: [
      {
        key: 'delete',
        text: t('DELETE'),
        action: 'delete',
        onClick: () => {
          const resource = tableRef.current?.getSelectedRowModel()?.rows.map(row => row.original!);
          deleteHpa({
            resource,
            type: 'metricsServer.title',
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
    authKey: module,
    params: {
      cluster,
      namespace,
    },
    actions: [
      {
        key: 'edit',
        action: 'edit',
        icon: <Pen />,
        text: t('metricsServer.edit'),
        onClick: (_, record) => {
          open({
            onOk: () => {
              close();
              refetch();
            },
            onCancel: close,
            detail,
            hpaDetail: record as IHpaDetail,
            params: { cluster, name, namespace },
          });
        },
      },
      {
        key: 'editYaml',
        action: 'edit',
        icon: <Pen />,
        text: t('metricsServer.editYaml'),
        onClick: (_, record) => {
          editYaml({
            initialValues: record,
            onSuccess: () => {
              notify.success(t('metricsServer.updateSuccess'));
              refetch();
            },
          });
        },
      },
      {
        key: 'delete',
        action: 'delete',
        icon: <Trash />,
        text: t('metricsServer.delete'),
        onClick: (_, record) => {
          deleteHpa({
            resource: record,
            type: 'metricsServer.title',
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
    authKey: module,
    params: {
      cluster,
      namespace,
    },
    actions: [
      {
        key: 'create',
        action: 'create',
        text: t('metricsServer.create'),
        props: {
          color: 'secondary',
          shadow: true,
        },
        disabled: !cluster || !namespace,
        onClick: e => {
          e.stopPropagation();
          e.preventDefault();
          openCreate({
            detail,
            workloadStore,
            params: { cluster, namespace, name },
            onOk: () => {
              closeCreate();
              refetch();
            },
            onCancel: closeCreate,
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
        header: t('metricsServer.field.name'),
        meta: {
          searchKey: 'name',
          sortable: true,
        },
        cell: info => {
          return (
            <Avatar
              icon={<SmcDuotone size={40} />}
              title={<a>{getDisplayName(info.row.original)}</a>}
              description={info.row.original.description}
            />
          );
        },
      },
      {
        accessorKey: 'status',
        header: t('metricsServer.field.status'),
        meta: {
          sortable: false,
          searchKey: 'status',
        },
        enableHiding: true,
        cell: info => <HpaStatus status={info.row.original.status} />,
      },
      {
        accessorKey: 'cpuTargetUtilization',
        header: t('metricsServer.targetCPUUsageWithNoUnit'),
        meta: {
          th: {
            width: '15%',
          },
        },
        enableHiding: true,
        cell: info => {
          const { cpuCurrentUtilization = 0, cpuTargetUtilization = 0 } = info.row.original;
          return (
            <Field
              value={cpuTargetUtilization ? `${cpuTargetUtilization}%` : '--'}
              label={`${t('metricsServer.current')}：${cpuCurrentUtilization}%`}
            />
          );
        },
      },
      {
        accessorKey: 'memoryTargetValue',
        header: t('metricsServer.targetMemoryUsageWithNoUnit'),
        meta: {
          th: {
            width: '15%',
          },
        },
        enableHiding: true,
        cell: info => {
          const { memoryCurrentValue = 0, memoryTargetValue = 0 } = info.row.original;
          let current;
          try {
            current = quantityToMi(memoryCurrentValue);
          } catch (error) {
            current = '--';
            console.error(error);
          }
          return (
            <Field
              value={memoryTargetValue}
              label={memoryCurrentValue ? `${t('metricsServer.current')}：${current}` : '--'}
            />
          );
        },
      },
      {
        accessorKey: 'minReplicas',
        header: t('metricsServer.minimumReplicas'),
        meta: {
          th: {
            width: '10%',
          },
        },
        enableHiding: true,
      },
      {
        accessorKey: 'maxReplicas',
        header: t('metricsServer.maximumReplicas'),
        meta: {
          th: {
            width: '10%',
          },
        },
        enableHiding: true,
        cell: info => info.getValue() ?? '-',
      },
      {
        accessorKey: 'namespace',
        header: t('metricsServer.field.project'),
        enableHiding: true,
        cell: info => {
          const value = info.getValue();
          return <ProjectAliasName project={value} workspace={workspace} />;
        },
      },
      {
        accessorKey: 'createTime',
        header: t('metricsServer.field.creationTime'),
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
    [namespace],
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
            batchActions: renderBatchActions(),
            toolbarRight: renderTableAction(),
          };
        },
        filters: () => {
          return {
            simpleMode: false,
            suggestions: [
              {
                key: 'name',
                label: t('metricsServer.field.name'),
              },
            ],
          };
        },
      },
    },
  });

  React.useEffect(() => {
    tableRef.current = table;
  }, []);

  const isEmpty =
    isFetched && (!query.page || query.page == 1) && !query.name && !data?.data?.length;

  return (
    <>
      {isEmpty ? (
        <Card padding={32}>
          <Empty
            icon={<SmcDuotone size={48} />}
            title={t('metricsServer.empty.title')}
            desc={t('metricsServer.empty.description')}
            actions={renderTableAction()}
          />
        </Card>
      ) : (
        <Container>
          <Card padding={0}>
            <DataTable.DataTable table={table} />
          </Card>
        </Container>
      )}
    </>
  );
};
