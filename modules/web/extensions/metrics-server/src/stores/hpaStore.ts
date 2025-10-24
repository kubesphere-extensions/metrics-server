import { create, UseBoundStore, StoreApi } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { get, merge } from 'lodash';
import { PartialDeep } from 'type-fest';
import type { FormMetrics } from '../components/Modal/helper';

type HpaData = {
  apiVersion: string;
  kind: string;
  metadata: {
    name: string;
    namespace: string;
    annotations: Record<string, string>;
    ownerReferences: Array<{
      apiVersion: string;
      blockOwnerDeletion: boolean;
      controller: boolean;
      kind: string;
      name: string;
      uid: string;
    }>;
  };
  spec: {
    metrics: {
      type: string;
      resource: {
        name: string;
        target: {
          type: string;
          averageUtilization?: string | number;
          averageValue?: string;
        };
      };
    }[];
    minReplicas: number;
    maxReplicas: number;
    scaleTargetRef: {
      apiVersion: string;
      kind: string;
      name: string;
    };
    behavior: {
      scaleDown: {
        selectPolicy?: string;
        stabilizationWindowSeconds?: number;
        policies?: {
          type: string;
          value: string;
          periodSeconds: number;
        }[];
      };
      scaleUp: {
        selectPolicy?: string;
        stabilizationWindowSeconds?: number;
        policies?: {
          type: string;
          value: string;
          periodSeconds: number;
        }[];
      };
    };
  };
};

type HpaStore = {
  formMetrics: FormMetrics;
  updateFormMetrics: (newData: PartialDeep<FormMetrics>) => void;
  selectWorkload: any;
  updateSelectWorkload: (newData: any) => void;
  hpaData: HpaData;
  updateHpaData: (newData: PartialDeep<HpaData>) => void;
};

type UseHpaStore = UseBoundStore<StoreApi<HpaStore>>;

const createHpaStore = (workloadDetail: any = {}) =>
  create<HpaStore>()(
    immer(set => ({
      selectWorkload: workloadDetail,
      updateSelectWorkload: newData =>
        set(draft => {
          draft.selectWorkload = newData;
        }),
      formMetrics: {
        cpu: {
          name: 'cpu',
          type: 'Utilization', // CPU Default to percentage
          value: '',
        },
        memory: {
          name: 'memory',
          type: 'AverageValue', // Memory Default to absolute value
          value: '',
        },
      },
      updateFormMetrics: newData =>
        set(draft => {
          const mergedData = merge({}, draft.formMetrics, newData);
          draft.formMetrics = mergedData;
        }),
      hpaData: {
        apiVersion: '',
        kind: 'HorizontalPodAutoscaler',
        metadata: {
          name: get(workloadDetail, 'name', ''),
          namespace: get(workloadDetail, 'namespace', ''),
          annotations: {
            cpuTargetUtilization: '',
            memoryTargetValue: '',
            'kubesphere.io/alias-name': '',
            'kubesphere.io/description': '',
          },
          ownerReferences: [
            {
              apiVersion: 'apps/v1',
              blockOwnerDeletion: true,
              controller: true,
              kind: get(workloadDetail, 'kind', ''),
              name: get(workloadDetail, 'name', ''),
              uid: get(workloadDetail, 'uid', ''),
            },
          ],
        },
        spec: {
          metrics: [],
          minReplicas: 1,
          maxReplicas: 1,
          scaleTargetRef: {
            apiVersion: 'apps/v1',
            kind: get(workloadDetail, 'kind', ''),
            name: get(workloadDetail, 'name', ''),
          },
          behavior: {
            scaleDown: {
              selectPolicy: 'Max',
              stabilizationWindowSeconds: 0,
            },
            scaleUp: {
              selectPolicy: 'Max',
              stabilizationWindowSeconds: 0,
            },
          },
        },
      },
      updateHpaData: newData =>
        set(draft => {
          const mergedData = merge({}, draft.hpaData, newData);
          if (newData.metadata?.ownerReferences) {
            mergedData.metadata.ownerReferences = newData.metadata.ownerReferences as any;
          }
          if (newData.spec?.metrics) {
            mergedData.spec.metrics = newData.spec.metrics as any;
          }
          draft.hpaData = mergedData;
        }),
    })),
  );

export { createHpaStore };
export type { UseHpaStore, HpaData, HpaStore };
