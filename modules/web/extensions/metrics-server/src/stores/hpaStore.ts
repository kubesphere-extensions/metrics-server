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
          value: number;
          periodSeconds: number;
        }[];
      };
      scaleUp: {
        selectPolicy?: string;
        stabilizationWindowSeconds?: number;
        policies?: {
          type: string;
          value: number;
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
  reset: () => void;
};

type UseHpaStore = UseBoundStore<StoreApi<HpaStore>>;

const createHpaStore = (workloadDetail: any = {}) => {
  const initialState = {
    selectWorkload: workloadDetail,
    formMetrics: {
      cpu: {
        name: 'cpu' as const,
        type: 'Utilization' as const, // CPU Default to percentage
        value: '',
      },
      memory: {
        name: 'memory' as const,
        type: 'AverageValue' as const, // Memory Default to absolute value
        value: '',
      },
    } as FormMetrics,
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
            stabilizationWindowSeconds: 300,
            policies: [
              {
                type: 'Percent',
                value: 100,
                periodSeconds: 15,
              },
            ],
          },
          scaleUp: {
            selectPolicy: 'Max',
            stabilizationWindowSeconds: 0,
            policies: [
              {
                type: 'Percent',
                value: 100,
                periodSeconds: 15,
              },
              {
                type: 'Pods',
                value: 4,
                periodSeconds: 15,
              },
            ],
          },
        },
      },
    } as HpaData,
  };

  return create<HpaStore>()(
    immer(set => ({
      ...initialState,
      updateSelectWorkload: newData =>
        set(draft => {
          draft.selectWorkload = newData;
        }),
      updateFormMetrics: newData =>
        set(draft => {
          const mergedData = merge({}, draft.formMetrics, newData);
          draft.formMetrics = mergedData;
        }),
      updateHpaData: newData =>
        set(draft => {
          const mergedData = merge({}, draft.hpaData, newData);
          if (newData.metadata?.ownerReferences) {
            mergedData.metadata.ownerReferences = newData.metadata.ownerReferences;
          }
          if (newData.spec?.metrics) {
            mergedData.spec.metrics = newData.spec.metrics;
          }
          // Handle policies arrays to ensure they are replaced, not merged
          if (newData.spec?.behavior?.scaleUp?.policies) {
            mergedData.spec.behavior.scaleUp.policies = newData.spec.behavior.scaleUp.policies;
          }
          if (newData.spec?.behavior?.scaleDown?.policies) {
            mergedData.spec.behavior.scaleDown.policies = newData.spec.behavior.scaleDown.policies;
          }
          draft.hpaData = mergedData;
        }),
      reset: () =>
        set(draft => {
          draft.selectWorkload = initialState.selectWorkload;
          draft.formMetrics = {
            cpu: {
              name: 'cpu' as const,
              type: 'Utilization' as const,
              value: '',
            },
            memory: {
              name: 'memory' as const,
              type: 'AverageValue' as const,
              value: '',
            },
          };
          draft.hpaData = {
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
                  stabilizationWindowSeconds: 300,
                  policies: [
                    {
                      type: 'Percent',
                      value: 100,
                      periodSeconds: 15,
                    },
                  ],
                },
                scaleUp: {
                  selectPolicy: 'Max',
                  stabilizationWindowSeconds: 0,
                  policies: [
                    {
                      type: 'Percent',
                      value: 100,
                      periodSeconds: 15,
                    },
                    {
                      type: 'Pods',
                      value: 4,
                      periodSeconds: 15,
                    },
                  ],
                },
              },
            },
          };
        }),
    })),
  );
};

export { createHpaStore };
export type { UseHpaStore, HpaData, HpaStore };
