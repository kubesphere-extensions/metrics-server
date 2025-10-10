import React, { forwardRef, useImperativeHandle } from 'react';
import { useForm, Form, FormItem, Input, Row, Col, Select } from '@kubed/components';
import { Cpu, Memory } from '@kubed/icons';
import { NumberInput } from '@ks-console/shared';
import { useHpaContext } from '../../../contexts/HpaContext';
import { PrefixInput } from '../../PrefixInput/PrefixInput';
import { FieldItem, FieldIcon, Field, FieldTitle, FieldDescription, FieldContent } from './styles';

const ScalerSettingForm = forwardRef(
  ({ onOk, hasMetricError }: { onOk?: () => void; hasMetricError?: boolean }, ref) => {
    useImperativeHandle(ref, () => {
      return { form };
    });
    const [form] = useForm();
    const { updateHpaData, hpaData, formMetrics, updateFormMetrics } = useHpaContext();

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
    return (
      <div style={{ padding: '0 20px 20px 20px' }}>
        <Form
          form={form}
          ref={ref}
          initialValues={hpaData}
          onFieldsChange={() => {
            updateHpaData(form.getFieldsValue());
          }}
          onFinish={() => {
            onOk?.();
          }}
        >
          <Row>
            <Col span={6}>
              <FormItem
                label={t('hpa.minimumReplicas')}
                name={['spec', 'minReplicas']}
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
                name={['spec', 'maxReplicas']}
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
                <PrefixInput label={t('hpa.metrics.targetType')}>
                  <Select
                    onChange={(value: string) => {
                      updateFormMetrics({
                        cpu: {
                          type: value,
                        },
                      });
                    }}
                    defaultValue={formMetrics.cpu.type}
                    showArrow
                    style={{ width: '100%' }}
                    options={options}
                  />
                </PrefixInput>
                <PrefixInput
                  label={t('hpa.metrics.targetValue')}
                  unit={formMetrics.cpu.type === 'Utilization' ? '%' : 'm'}
                >
                  <NumberInput
                    integer={false}
                    min={0}
                    max={Infinity}
                    onChange={(value: number) => {
                      updateFormMetrics({
                        cpu: {
                          value,
                        },
                      });
                    }}
                    style={{ width: '100%' }}
                    defaultValue={formMetrics.cpu.value}
                  />
                </PrefixInput>
              </FieldItem>
              <FieldItem>
                <FieldIcon>
                  <Memory />
                  {t('hpa.common.memory')}
                </FieldIcon>
                <PrefixInput label={t('hpa.metrics.targetType')}>
                  <Select
                    onChange={(value: string) => {
                      updateFormMetrics({
                        memory: {
                          type: value,
                        },
                      });
                    }}
                    defaultValue={formMetrics.memory.type}
                    showArrow
                    style={{ width: '100%' }}
                    options={options}
                  />
                </PrefixInput>
                {formMetrics.memory.type === 'AverageValue' ? (
                  <PrefixInput label={t('hpa.metrics.targetValue')}>
                    <Input
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        updateFormMetrics({
                          memory: {
                            value: e.target.value,
                          },
                        });
                      }}
                      suffix={'Mi'}
                      style={{ width: '100%' }}
                      defaultValue={formMetrics.memory.value}
                    />
                  </PrefixInput>
                ) : (
                  <PrefixInput label={t('hpa.metrics.targetValue')} unit="%">
                    <NumberInput
                      min={0}
                      integer={false}
                      max={Infinity}
                      onChange={(value: number) => {
                        updateFormMetrics({
                          memory: {
                            value,
                          },
                        });
                      }}
                      style={{ width: '100%' }}
                      defaultValue={formMetrics.memory.value}
                    />
                  </PrefixInput>
                )}
              </FieldItem>
            </FieldContent>
            {hasMetricError ? (
              <div style={{ marginTop: 12, color: '#bd3633' }}>
                {t('hpa.validation.metrics.required')}
              </div>
            ) : null}
          </Field>
        </Form>
      </div>
    );
  },
);

export { ScalerSettingForm };
