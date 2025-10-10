import React from 'react';
import {
  Form,
  FormItem,
  Modal,
  useForm,
  Row,
  Col,
  Select,
  Button,
  FormList,
  notify,
} from '@kubed/components';
import { IHpaDetail, BasePathParams, NumberInput } from '@ks-console/shared';
import { Cpu, Memory } from '@kubed/icons';
import { get } from 'lodash';
import {
  FieldItem,
  FieldIcon,
  Field,
  FieldTitle,
  FieldDescription,
  FieldContent,
  FormContent,
} from './styles';
import { PrefixInput } from '../../PrefixInput/PrefixInput';
import { Toggle } from '../../Toggle/Toggle';
import { useEditMutation } from '../../../data/useEditMutation';
import { convertMetrics } from '../helper';

type HpaFormModalProps = {
  hpaDetail: IHpaDetail;
  params: BasePathParams;
  onOk: () => void;
  onCancel: () => void;
  open: boolean;
};
const HpaScalerSettingModal = ({ params, onOk, onCancel, open, hpaDetail }: HpaFormModalProps) => {
  const { cluster, namespace } = params;
  const { name } = hpaDetail;
  const [form] = useForm();
  const { mutate: patchHpa } = useEditMutation({
    cluster,
    name,
    namespace,
  });
  const SELECT_POLICY_OPTIONS = [
    { label: t('hpa.advanceSettings.policyPreference.max'), value: 'Max' },
    { label: t('hpa.advanceSettings.policyPreference.min'), value: 'Min' },
    { label: t('hpa.advanceSettings.policyPreference.disabled'), value: 'Disabled' },
  ];
  const POLICIES_TYPE_OPTIONS = [
    {
      label: t('hpa.advanceSettings.policyPreference.pod'),
      value: 'Pods',
    },
    {
      label: t('hpa.advanceSettings.policyPreference.percent'),
      value: 'Percent',
    },
  ];
  const metrics = hpaDetail?._originData?.spec?.metrics;
  const cpuMetric = metrics.find((metric: any) => metric?.resource?.name === 'cpu');
  const memoryMetric = metrics.find((metric: any) => metric?.resource?.name === 'memory');
  const cpuMetricType = cpuMetric?.resource.target?.type;
  const memoryMetricType = memoryMetric?.resource.target?.type;
  const cpuMetricValue =
    cpuMetric?.resource.target?.averageUtilization ||
    cpuMetric?.resource.target?.averageValue ||
    '';
  const memoryMetricValue =
    memoryMetric?.resource.target?.averageUtilization ||
    memoryMetric?.resource.target?.averageValue ||
    '';
  const initialValues: any = {
    minReplicas: get(hpaDetail, '_originData.spec.minReplicas', 0),
    maxReplicas: get(hpaDetail, '_originData.spec.maxReplicas', 1),
    metrics: {
      cpu: {
        name: 'cpu',
        type: cpuMetricType || 'Utilization',
        value: cpuMetricValue ? parseFloat(cpuMetricValue) : '',
      },
      memory: {
        name: 'memory',
        type: memoryMetricType || 'Utilization',
        value: memoryMetricValue ? parseFloat(memoryMetricValue) : '',
      },
    },
    behavior: get(hpaDetail, '_originData.spec.behavior', {}),
  };
  const options = [
    {
      label: t('hpa.metrics.targetType.percentage'),
      value: 'Utilization',
    },
    {
      label: t('hpa.metrics.targetType.averageValue'),
      value: 'AverageValue',
    },
  ];
  const hasMetricError = false;
  const onFinish = () => {
    form.validateFields().then(() => {
      const formValues = form.getFieldsValue(true);
      const hpaData = hpaDetail?._originData;
      hpaData.spec.metrics = convertMetrics(formValues.metrics);
      hpaData.spec.behavior = formValues.behavior;
      hpaData.spec.minReplicas = formValues.minReplicas;
      hpaData.spec.maxReplicas = formValues.maxReplicas;
      onEdit(hpaData);
      // onEdit(formValues);
    });
  };
  const onEdit = (formValues: any) => {
    patchHpa(formValues, {
      onSuccess: () => {
        onOk();
        form.resetFields();
        notify.success(t('hpa.common.updateSuccess'));
      },
    });
  };
  return (
    <Modal
      width={960}
      title={t('hpa.common.editBaseInfo')}
      visible={open}
      onCancel={onCancel}
      onOk={() => {
        onFinish();
      }}
    >
      <div style={{ padding: '0 20px 20px 20px' }}>
        <Form form={form} initialValues={initialValues}>
          <Row>
            <Col span={6}>
              <FormItem
                label={t('hpa.minimumReplicas')}
                name={['minReplicas']}
                help={t('hpa.minimumReplicas.help')}
                rules={[
                  {
                    required: true,
                    message: t('hpa.validation.minimumReplicas.required'),
                  },
                ]}
              >
                <NumberInput min={1} max={Infinity} integer />
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem
                label={t('hpa.maximumReplicas')}
                name={['maxReplicas']}
                help={t('hpa.maximumReplicas.help')}
                rules={[
                  {
                    required: true,
                    message: t('hpa.validation.maximumReplicas.required'),
                  },
                ]}
              >
                <NumberInput min={1} max={Infinity} integer />
              </FormItem>
            </Col>
          </Row>
          <Field>
            <FieldTitle>{t('hpa.metrics.title')}</FieldTitle>
            <FieldDescription>{t('hpa.metrics.description')}</FieldDescription>
            <FieldContent>
              <FieldItem>
                <FieldIcon>
                  <Cpu />
                  {t('hpa.common.cpu')}
                </FieldIcon>
                <FormItem name={['metrics', 'cpu', 'type']}>
                  {control => (
                    <PrefixInput label={t('hpa.metrics.targetType')}>
                      <Select {...control} showArrow options={options} />
                    </PrefixInput>
                  )}
                </FormItem>
                <FormItem
                  shouldUpdate={(prevValues, curValues) =>
                    prevValues.metrics?.cpu?.type !== curValues.metrics?.cpu?.type
                  }
                >
                  {() => {
                    const cpuType = form.getFieldValue(['metrics', 'cpu', 'type']);
                    return (
                      <FormItem name={['metrics', 'cpu', 'value']}>
                        {control => (
                          <PrefixInput
                            label={t('hpa.metrics.targetValue')}
                            unit={cpuType === 'Utilization' ? '%' : 'm'}
                          >
                            <NumberInput {...control} integer={false} min={0} max={Infinity} />
                          </PrefixInput>
                        )}
                      </FormItem>
                    );
                  }}
                </FormItem>
              </FieldItem>
              <FieldItem>
                <FieldIcon>
                  <Memory />
                  {t('hpa.common.memory')}
                </FieldIcon>
                <FormItem name={['metrics', 'memory', 'type']}>
                  {control => (
                    <PrefixInput label={t('hpa.metrics.targetType')}>
                      <Select {...control} showArrow options={options} />
                    </PrefixInput>
                  )}
                </FormItem>
                <FormItem
                  shouldUpdate={(prevValues, curValues) =>
                    prevValues.metrics?.memory?.type !== curValues.metrics?.memory?.type
                  }
                >
                  {() => {
                    const memoryType = form.getFieldValue(['metrics', 'memory', 'type']);
                    return (
                      <FormItem name={['metrics', 'memory', 'value']}>
                        {control => (
                          <PrefixInput
                            label={t('hpa.metrics.targetValue')}
                            unit={memoryType === 'AverageValue' ? 'Mi' : '%'}
                          >
                            <NumberInput {...control} integer={false} min={0} max={Infinity} />
                          </PrefixInput>
                        )}
                      </FormItem>
                    );
                  }}
                </FormItem>
              </FieldItem>
            </FieldContent>
            {hasMetricError ? (
              <div style={{ marginTop: 12, color: '#bd3633' }}>
                {t('hpa.validation.metrics.required')}
              </div>
            ) : null}
          </Field>
          <Toggle>
            <FormContent>
              <div style={{ marginBottom: 8, fontWeight: 600 }}>
                {t('hpa.advanceSettings.scaleUp.title')}
              </div>
              <div
                style={{
                  border: '1px solid #d9dee4',
                  borderRadius: '4px',
                  padding: '0 12px 12px 12px',
                  background: '#fff',
                }}
              >
                <Row>
                  <Col span={6}>
                    <FormItem
                      name={['behavior', 'scaleUp', 'selectPolicy']}
                      label={t('hpa.advanceSettings.policyPreference')}
                      help={t('hpa.advanceSettings.policyPreference.help')}
                    >
                      <Select showArrow options={SELECT_POLICY_OPTIONS} />
                    </FormItem>
                  </Col>
                  <Col span={6}>
                    <FormItem
                      name={['behavior', 'scaleUp', 'stabilizationWindowSeconds']}
                      label={t('hpa.advanceSettings.stabilizationWindowSeconds')}
                      help={t('hpa.advanceSettings.stabilizationWindowSeconds.help')}
                    >
                      <NumberInput integer min={0} max={Infinity} />
                    </FormItem>
                  </Col>
                </Row>
                <FormList name={['behavior', 'scaleUp', 'policies']}>
                  {(fields, { add, remove }) => (
                    <>
                      {fields.map(({ key, name, ...restField }, index) => (
                        <FieldItem key={key}>
                          <FormItem {...restField} name={[name, 'type']}>
                            {control => (
                              <PrefixInput label={t('hpa.advanceSettings.policyPreference')}>
                                <Select {...control} showArrow options={POLICIES_TYPE_OPTIONS} />
                              </PrefixInput>
                            )}
                          </FormItem>
                          <FormItem {...restField} name={[name, 'value']}>
                            {(control, _, form) => {
                              const policyType = form.getFieldValue([
                                'behavior',
                                'scaleUp',
                                'policies',
                                index,
                                'type',
                              ]);
                              return (
                                <PrefixInput
                                  label={t('hpa.advanceSettings.value')}
                                  unit={policyType === 'Percent' ? '%' : ''}
                                >
                                  <NumberInput
                                    {...control}
                                    min={0}
                                    max={Infinity}
                                    integer={false}
                                  />
                                </PrefixInput>
                              );
                            }}
                          </FormItem>
                          <FormItem {...restField} name={[name, 'periodSeconds']}>
                            {control => (
                              <PrefixInput
                                label={t('hpa.advanceSettings.stabilizationWindowSeconds.value')}
                              >
                                <NumberInput {...control} integer min={0} max={Infinity} />
                              </PrefixInput>
                            )}
                          </FormItem>
                          <Button onClick={() => remove(name)}>{t('hpa.common.delete')}</Button>
                        </FieldItem>
                      ))}
                      <div style={{ textAlign: 'right', marginTop: '8px' }}>
                        <Button onClick={() => add()}>{t('hpa.common.add')}</Button>
                      </div>
                    </>
                  )}
                </FormList>
              </div>
            </FormContent>
            <FormContent>
              <div style={{ marginBottom: 8, fontWeight: 600 }}>
                {t('hpa.advanceSettings.scaleDown.title')}
              </div>
              <div
                style={{
                  border: '1px solid #d9dee4',
                  borderRadius: '4px',
                  padding: '0 12px 12px 12px',
                  background: '#fff',
                }}
              >
                <Row>
                  <Col span={6}>
                    <FormItem
                      name={['behavior', 'scaleDown', 'selectPolicy']}
                      label={t('hpa.advanceSettings.policyPreference')}
                      help={t('hpa.advanceSettings.policyPreference.help')}
                    >
                      <Select showArrow options={SELECT_POLICY_OPTIONS} />
                    </FormItem>
                  </Col>
                  <Col span={6}>
                    <FormItem
                      name={['behavior', 'scaleDown', 'stabilizationWindowSeconds']}
                      label={t('hpa.advanceSettings.stabilizationWindowSeconds')}
                      help={t('hpa.advanceSettings.stabilizationWindowSeconds.help')}
                    >
                      <NumberInput integer min={0} max={Infinity} />
                    </FormItem>
                  </Col>
                </Row>
                <FormList name={['behavior', 'scaleDown', 'policies']}>
                  {(fields, { add, remove }) => (
                    <>
                      {fields.map(({ key, name, ...restField }, index) => (
                        <FieldItem key={key}>
                          <FormItem {...restField} name={[name, 'type']}>
                            {control => (
                              <PrefixInput label={t('hpa.advanceSettings.policyPreference')}>
                                <Select {...control} showArrow options={POLICIES_TYPE_OPTIONS} />
                              </PrefixInput>
                            )}
                          </FormItem>
                          <FormItem {...restField} name={[name, 'value']}>
                            {(control, _, form) => {
                              const policyType = form.getFieldValue([
                                'behavior',
                                'scaleDown',
                                'policies',
                                index,
                                'type',
                              ]);
                              return (
                                <PrefixInput
                                  label={t('hpa.advanceSettings.value')}
                                  unit={policyType === 'Percent' ? '%' : ''}
                                >
                                  <NumberInput
                                    {...control}
                                    min={0}
                                    max={Infinity}
                                    integer={false}
                                  />
                                </PrefixInput>
                              );
                            }}
                          </FormItem>
                          <FormItem {...restField} name={[name, 'periodSeconds']}>
                            {control => (
                              <PrefixInput
                                label={t('hpa.advanceSettings.stabilizationWindowSeconds.value')}
                              >
                                <NumberInput {...control} integer min={0} max={Infinity} />
                              </PrefixInput>
                            )}
                          </FormItem>
                          <Button onClick={() => remove(name)}>{t('hpa.common.delete')}</Button>
                        </FieldItem>
                      ))}
                      <div style={{ textAlign: 'right', marginTop: '8px' }}>
                        <Button onClick={() => add()}>{t('hpa.common.add')}</Button>
                      </div>
                    </>
                  )}
                </FormList>
              </div>
            </FormContent>
          </Toggle>
        </Form>
      </div>
    </Modal>
  );
};
export { HpaScalerSettingModal };
