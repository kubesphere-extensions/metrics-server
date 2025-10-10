import React, { useRef, useState } from 'react';
import { Modal, Steps, TabStep, Button, Switch } from '@kubed/components';
import { Appcenter } from '@kubed/icons';
import { CreateBasicInfoForm } from '../../Form/CreateBasicInfoForm/CreateBasicInfoForm';
import { ScalerSettingForm } from '../../Form/ScalerSettingForm/ScalerSettingForm';
import { Header } from './styles';
import { YamlEditor } from '../../YamlEditor/YamlEditor';
import { UseHpaStore } from '../../../stores/hpaStore';
import { HpaProvider } from '../../../contexts/HpaContext';
import { WorkloadForm } from '../../Form/WorkloadForm/WorkloadForm';
import { isK8sVersionAbove } from '@ks-console/shared';
import { quantityToMi } from '../../../utils';
import { AdvancedForm } from '../../Form/AdvancedForm/AdvancedForm';
import { useHpaCreateMutation } from '../../../data/useHpaCreateMutation';
import { convertMetrics } from '../helper';
type HpaCreateModalProps = {
  onOk: () => void;
  onCancel: () => void;
  open: boolean;
  extraParams: Record<string, any>;
  useHpaStore: UseHpaStore;
};
const HpaCreateModal = ({
  open,
  onCancel,
  extraParams,
  useHpaStore,
  onOk,
}: HpaCreateModalProps) => {
  const hpaData = useHpaStore(state => state.hpaData);
  const updateHpaData = useHpaStore(state => state.updateHpaData);
  const formMetrics = useHpaStore(state => state.formMetrics);
  const updateFormMetrics = useHpaStore(state => state.updateFormMetrics);
  const selectWorkload = useHpaStore(state => state.selectWorkload);
  const updateSelectWorkload = useHpaStore(state => state.updateSelectWorkload);
  const k8sVersion = globals.clusterConfig?.[extraParams?.cluster!]?.k8sVersion;
  const apiVersion = isK8sVersionAbove('v1.23.0', k8sVersion ?? 'v1.23.0')
    ? 'autoscaling/v2'
    : 'autoscaling/v2beta2';

  const [hasMetricError, setHasMetricError] = useState(false);

  const { mutate: createHpa } = useHpaCreateMutation({
    params: extraParams,
    options: {
      onSuccess: () => {
        onOk?.();
      },
    },
  });
  const baseInfoFromRef = useRef<any>(null);
  const scalerSettingFromRef = useRef<any>(null);
  const advancedFormFromRef = useRef<any>(null);

  const [active, setActive] = useState(0);
  const nextStep = () => setActive(current => (current < 2 ? current + 1 : current));
  const prevStep = () => setActive(current => (current > 0 ? current - 1 : current));

  const [isYamlMode, setIsYamlMode] = useState(false);

  const ModalFooter = () => {
    return isYamlMode ? (
      <Button
        loading={false}
        onClick={() => {
          createHpa(hpaData);
        }}
        radius="xl"
        shadow
        color="secondary"
      >
        {t('hpa.common.create')}
      </Button>
    ) : (
      <>
        <Button onClick={onCancel} radius="xl">
          {t('hpa.common.cancel')}
        </Button>
        {active !== 0 && (
          <Button onClick={prevStep} disabled={active <= 0}>
            {t('hpa.common.previous')}
          </Button>
        )}
        {active !== 2 ? (
          <Button
            onClick={() => {
              if (active === 0) {
                baseInfoFromRef?.current?.form.submit();
              } else if (active === 1) {
                if (formMetrics.cpu.value === '' && formMetrics.memory.value === '') {
                  setHasMetricError(true);
                  return;
                } else {
                  setHasMetricError(false);
                  scalerSettingFromRef?.current?.form.submit();
                  const metrics = convertMetrics(formMetrics);
                  updateHpaData({
                    apiVersion,
                    spec: {
                      metrics,
                    },
                  });
                }
              }
            }}
            color="secondary"
            disabled={active >= 2}
          >
            {t('hpa.common.next')}
          </Button>
        ) : (
          <Button
            loading={false}
            onClick={() => {
              advancedFormFromRef?.current?.form.submit();
              createHpa(hpaData);
            }}
            radius="xl"
            shadow
            color="secondary"
          >
            {t('hpa.common.ok')}
          </Button>
        )}
      </>
    );
  };
  const handleNext = () => {
    nextStep();
  };

  const handleYamlModeChange = (checked: boolean) => {
    if (checked) {
      // convert formData to yaml
      const metrics = convertMetrics(formMetrics);
      updateHpaData({
        apiVersion,
        spec: {
          metrics,
        },
      });
    } else {
      const metrics = hpaData.spec.metrics;
      const cpuMetric = metrics.find((metric: any) => metric.resource.name === 'cpu');
      const memoryMetric = metrics.find((metric: any) => metric.resource.name === 'memory');
      const cpuMetricType = cpuMetric?.resource.target?.type;
      const memoryMetricType = memoryMetric?.resource.target?.type;
      const cpuMetricValue =
        cpuMetric?.resource.target?.averageUtilization ||
        cpuMetric?.resource.target?.averageValue ||
        '';
      const memoryMetricValue =
        memoryMetric?.resource.target?.averageUtilization ||
        quantityToMi(memoryMetric?.resource.target?.averageValue).value ||
        '';

      const formDataMetrics = {
        cpu: {
          type: cpuMetricType,
          value: cpuMetricValue,
        },
        memory: {
          type: memoryMetricType,
          value: memoryMetricValue,
        },
      };
      updateFormMetrics(formDataMetrics);
    }
    setIsYamlMode(checked);
  };

  const ModalHeader = () => {
    return (
      <Header>
        <div>{t('hpa.modal.create.title')}</div>
        <Switch
          variant="button"
          label={t('hpa.common.editYaml')}
          checked={isYamlMode}
          onChange={handleYamlModeChange}
        />
      </Header>
    );
  };
  const handleWorkloadAdd = () => {
    setIsShowWorkloadForm(true);
  };
  const [isShowWorkloadForm, setIsShowWorkloadForm] = useState(false);

  return (
    <HpaProvider
      hpaData={hpaData}
      extraParams={extraParams}
      updateHpaData={updateHpaData}
      formMetrics={formMetrics}
      updateFormMetrics={updateFormMetrics}
      selectWorkload={selectWorkload}
      updateSelectWorkload={updateSelectWorkload}
    >
      <Modal
        width={960}
        header={<ModalHeader></ModalHeader>}
        visible={open}
        onCancel={onCancel}
        title={t('hpa.modal.create.title')}
        footer={<ModalFooter></ModalFooter>}
      >
        {!isYamlMode ? (
          <Steps active={active} variant="tab">
            <TabStep
              label={t('hpa.common.basicInfo')}
              description={t('hpa.common.unCompletedDescription')}
              completedDescription={t('hpa.common.completedDescription')}
              progressDescription={t('hpa.common.progressDescription')}
              icon={<Appcenter size={24} />}
            >
              {!isShowWorkloadForm ? (
                <CreateBasicInfoForm
                  ref={baseInfoFromRef}
                  onOk={() => {
                    handleNext();
                  }}
                  onWorkloadAdd={handleWorkloadAdd}
                ></CreateBasicInfoForm>
              ) : (
                <WorkloadForm
                  onCancel={() => {
                    setIsShowWorkloadForm(false);
                  }}
                  onOk={() => {
                    setIsShowWorkloadForm(false);
                  }}
                  onBack={() => {
                    setIsShowWorkloadForm(false);
                  }}
                ></WorkloadForm>
              )}
            </TabStep>
            <TabStep
              label={t('hpa.common.scalerSetting')}
              description={t('hpa.common.unCompletedDescription')}
              completedDescription={t('hpa.common.completedDescription')}
              progressDescription={t('hpa.common.progressDescription')}
              icon={<Appcenter size={24} />}
            >
              <ScalerSettingForm
                ref={scalerSettingFromRef}
                hasMetricError={hasMetricError}
                onOk={() => {
                  handleNext();
                }}
              />
            </TabStep>
            <TabStep
              label={t('hpa.common.advancedSettings')}
              description={t('hpa.common.unCompletedDescription')}
              completedDescription={t('hpa.common.completedDescription')}
              progressDescription={t('hpa.common.progressDescription')}
              icon={<Appcenter size={24} />}
            >
              <AdvancedForm onOk={() => {}} ref={advancedFormFromRef} />
            </TabStep>
          </Steps>
        ) : (
          <YamlEditor></YamlEditor>
        )}
      </Modal>
    </HpaProvider>
  );
};
export { HpaCreateModal };
