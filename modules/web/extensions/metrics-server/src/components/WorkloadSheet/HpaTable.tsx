import {
  Avatar,
  defaultCheckboxColumn,
  getDisplayName,
  getLocalTime,
  IHpaDetail,
  joinSelector,
  tableState2Query,
  useBatchActions,
  useItemActions,
  useModalAction,
  useTableActions,
  EventsSheet,
} from '@ks-console/shared';
import { Card, DataTable, Field } from '@kubed/components';
import { Pen, Trash, Stretch } from '@kubed/icons';
import { ColumnDef, Table } from '@tanstack/react-table';
import * as React from 'react';
import styled from 'styled-components';
import { Empty } from '../Empty/Empty';
import { HpaCreateModal } from '../Modal/HpaCreateModal/HpaCreateModal';

import { HpaStatus } from '../HpaStatus/HpaStatus';
import { HpaEditModal } from '../Modal/HpaEditModal/HpaEditModal';
import { transformBytes } from '../../utils';
import { useHpaList } from '../../data/useHpaList';
import { useDelete } from '../../hooks/useDelete';
import { createHpaStore } from '../../stores/hpaStore';
import { WorkloadHpaDetailSheet } from '../WorkloadDetailSheet/WorkloadDetailSheet';
import { get } from 'lodash';
import { HpaYamlModal } from '../Modal/HpaYamlModal';
import { HpaScalerSettingModal } from '../Modal/HpaScalerSettingModal/HpaScalerSettingModal';
import { HpaIcon } from '../Icon/HpaIcon';
import { WORKLOAD_KIND_TEXT_MAP } from '../../constant';

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
  const { cluster, workspace, namespace, kind, name, detail: workloadDetail, module } = props;

  const [state, setState] = React.useState<Record<string, any>>({});
  const { open: openDetail } = useModalAction({
    modal: WorkloadHpaDetailSheet,
    id: 'workload-hpa-detail',
  });

  const { open: openEvents } = useModalAction({
    modal: EventsSheet,
    id: 'hpa-events',
  });

  const query: Query = React.useMemo(() => {
    return {
      cluster,
      namespace,
      labelSelector: joinSelector({
        'autoscaling.kubesphere.io/scale-target-kind': kind,
        'autoscaling.kubesphere.io/scale-target-name': name,
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
  const { open: openYaml, close: closeYaml } = useModalAction({
    modal: HpaYamlModal,
    id: 'hpa-yaml',
  });
  const { open: openScaler, close: closeScaler } = useModalAction({
    modal: HpaScalerSettingModal,
    id: 'hpa-scalerSettings',
  });

  const tableRef = React.useRef<Table<RecordType>>();

  const { deleteHpa } = useDelete();

  const renderBatchActions = useBatchActions({
    authKey: module,
    params: {
      cluster,
      namespace,
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
        text: t('hpa.common.editBaseInfo'),
        onClick: (_, record) => {
          open({
            onOk: () => {
              close();
              refetch();
            },
            onCancel: close,
            hpaDetail: record as IHpaDetail,
            params: { cluster, namespace },
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
        action: 'edit',
        icon: <Pen />,
        text: t('hpa.common.editScalerSettings'),
        onClick: (_, record) => {
          openScaler({
            hpaDetail: record as IHpaDetail,
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
    authKey: module,
    params: {
      cluster,
      namespace,
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
        disabled: !cluster || !namespace,
        onClick: e => {
          e.stopPropagation();
          e.preventDefault();
          openCreate({
            useHpaStore: createHpaStore(workloadDetail),
            extraParams: {
              cluster,
              name,
              workspace,
              namespace,
              kind,
              workloadDetail,
              module,
            },
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
        header: t('hpa.policyName'),
        meta: {
          searchKey: 'name',
          sortable: true,
        },
        cell: info => {
          return (
            <Avatar
              icon={<HpaIcon />}
              title={
                <a
                  onClick={() => {
                    const detail = info.row.original;
                    openDetail({
                      params: {
                        cluster,
                        namespace,
                        name: detail.name,
                        workspace,
                      },
                      refetch,
                      detail,
                    });
                  }}
                >
                  {getDisplayName(info.row.original)}
                </a>
              }
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
            onClick={() => {
              openEvents({ detail: info.row.original, headerTitle: t('hpa.common.viewEvents') });
            }}
            status={info.row.original.status}
          />
        ),
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
          const { cpuCurrentUtilization = 0, cpuTargetUtilization = 0 } = info.row.original;
          return (
            <Field
              value={cpuTargetUtilization ? `${cpuTargetUtilization}%` : '--'}
              label={`${t('hpa.common.current')}：${cpuCurrentUtilization}%`}
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
          const { memoryCurrentValue = 0, memoryTargetValue = 0 } = info.row.original;
          return (
            <Field
              value={memoryTargetValue}
              label={
                memoryCurrentValue
                  ? `${t('hpa.common.current')}：${transformBytes(memoryCurrentValue)}`
                  : '--'
              }
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
                label: t('hpa.common.name'),
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
            icon={<Stretch size={48} />}
            title={t('hpa.empty.title')}
            desc={t('hpa.empty.description')}
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
