import React, { forwardRef, useImperativeHandle } from 'react';
import { Col, Row, useForm, FormList, Button, Select } from '@kubed/components';
import { Form, FormItem } from '@kubed/components';
import { Toggle } from '../../Toggle/Toggle';
import { useHpaContext } from '../../../contexts/HpaContext';
import { FieldItem, FormContent } from './styles';
import { PrefixInput } from '../../PrefixInput/PrefixInput';
import { NumberInput } from '@ks-console/shared';

const AdvancedForm = forwardRef(({ onOk }: { onOk?: () => void }, ref) => {
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

  const SELECT_POLICY_OPTIONS = [
    { label: t('hpa.advanceSettings.policyPreference.max'), value: 'Max' },
    { label: t('hpa.advanceSettings.policyPreference.min'), value: 'Min' },
    { label: t('hpa.advanceSettings.policyPreference.disabled'), value: 'Disabled' },
  ];
  const { hpaData, updateHpaData } = useHpaContext();
  useImperativeHandle(ref, () => {
    return { form };
  });
  const [form] = useForm();
  return (
    <div style={{ padding: '0 20px 20px 20px' }}>
      <Toggle>
        <Form
          initialValues={hpaData}
          form={form}
          ref={ref}
          onFinish={() => {
            onOk?.();
          }}
          onFieldsChange={() => {
            updateHpaData(form.getFieldsValue());
          }}
        >
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
                    name={['spec', 'behavior', 'scaleUp', 'selectPolicy']}
                    label={t('hpa.advanceSettings.policyPreference')}
                    help={t('hpa.advanceSettings.policyPreference.help')}
                  >
                    <Select showArrow options={SELECT_POLICY_OPTIONS} />
                  </FormItem>
                </Col>
                <Col span={6}>
                  <FormItem
                    name={['spec', 'behavior', 'scaleUp', 'stabilizationWindowSeconds']}
                    label={t('hpa.advanceSettings.stabilizationWindowSeconds')}
                    help={t('hpa.advanceSettings.stabilizationWindowSeconds.help')}
                  >
                    <NumberInput integer min={0} max={Infinity} />
                  </FormItem>
                </Col>
              </Row>
              <FormList name={['spec', 'behavior', 'scaleUp', 'policies']}>
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
                              'spec',
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
                                <NumberInput {...control} min={0} max={Infinity} integer={false} />
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
                    name={['spec', 'behavior', 'scaleDown', 'selectPolicy']}
                    label={t('hpa.advanceSettings.policyPreference')}
                    help={t('hpa.advanceSettings.policyPreference.help')}
                  >
                    <Select showArrow options={SELECT_POLICY_OPTIONS} />
                  </FormItem>
                </Col>
                <Col span={6}>
                  <FormItem
                    name={['spec', 'behavior', 'scaleDown', 'stabilizationWindowSeconds']}
                    label={t('hpa.advanceSettings.stabilizationWindowSeconds')}
                    help={t('hpa.advanceSettings.stabilizationWindowSeconds.help')}
                  >
                    <NumberInput integer min={0} max={Infinity} />
                  </FormItem>
                </Col>
              </Row>
              <FormList name={['spec', 'behavior', 'scaleDown', 'policies']}>
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
                              'spec',
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
                                <NumberInput {...control} min={0} max={Infinity} integer={false} />
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
        </Form>
      </Toggle>
    </div>
  );
});

export { AdvancedForm };
