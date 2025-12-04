import React, { forwardRef, useImperativeHandle, MouseEvent } from 'react';
import { Form, FormItem, Input, Textarea, useForm, Row, Col, Button } from '@kubed/components';
import { Pen, Trash, Backup } from '@kubed/icons';
import styled from 'styled-components';
import { useHpaContext } from '../../../contexts/HpaContext';
import { getLocalTime } from '@ks-console/shared';
import { WorkloadAddCard } from '../../WorkloadAddCard/WorkloadAddCard';
import { isEmpty } from 'lodash';
import { WorkloadStatus } from '../../WorkloadStatus/WorkloadStatus';
import { WORKLOAD_KIND_MAP } from '../../../constant';
import { NamespaceSelector } from '../../NamespaceSelector';

type BaseInfoFormProps = {
  onOk?: () => void;
  onWorkloadAdd?: () => void;
};

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
`;

const GridItem = styled.div`
  min-width: 0;
`;

const Description = styled.div`
  color: #79879c;
`;
const ActionContainer = styled.div`
  height: 100%;
  display: none;
  align-items: center;
  justify-content: flex-end;
`;
const WorkloadContainer = styled.div`
  border: 1px solid #ccd3db;
  border-radius: 4px;
  &:hover {
    ${ActionContainer} {
      display: flex;
    }
  }
`;

const BaseForm = ({ onOk, onWorkloadAdd }: BaseInfoFormProps, ref: any) => {
  const [form] = useForm();
  const { extraParams, hpaData, updateHpaData, selectWorkload, updateSelectWorkload } =
    useHpaContext();
  useImperativeHandle(ref, () => {
    return { form };
  });

  const { cluster, workspace } = extraParams;
  return (
    <div style={{ padding: 20 }}>
      <Form
        form={form}
        initialValues={hpaData}
        onFieldsChange={() => {
          updateHpaData(form.getFieldsValue());
        }}
        onFinish={() => {
          onOk?.();
        }}
      >
        <GridContainer>
          <GridItem>
            <FormItem
              name={['metadata', 'name']}
              label={t('hpa.common.name')}
              help={t('hpa.common.name.help')}
              rules={[
                {
                  required: true,
                  message: t('hpa.validation.name.required'),
                },
                {
                  pattern: /^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/,
                  message: t('hpa.validation.name.pattern'),
                },
              ]}
            >
              <Input autoComplete="off" autoFocus={true} maxLength={63} />
            </FormItem>
          </GridItem>

          <GridItem>
            <FormItem
              label={t('hpa.common.aliasName')}
              help={t('hpa.common.aliasName.help')}
              name={['metadata', 'annotations', 'kubesphere.io/alias-name']}
            >
              <Input autoComplete="off" maxLength={63} />
            </FormItem>
          </GridItem>

          {!workspace ? (
            <GridItem>
              <FormItem
                name={['metadata', 'namespace']}
                label={t('hpa.common.project')}
                help={t('hpa.common.project.help')}
                rules={[{ required: true, message: t('hpa.validation.namespace.required') }]}
              >
                <NamespaceSelector cluster={cluster}></NamespaceSelector>
              </FormItem>
            </GridItem>
          ) : null}

          <GridItem>
            <FormItem
              label={t('hpa.common.description')}
              help={t('hpa.common.description.help')}
              name={['metadata', 'description']}
            >
              <Textarea maxLength={256} rows={3} />
            </FormItem>
          </GridItem>
        </GridContainer>
        <FormItem
          label={t('hpa.scaleTarget')}
          name={['spec', 'scaleTargetRef', 'name']}
          rules={[
            {
              required: true,
              message: t('hpa.validation.scaleTarget.required'),
            },
          ]}
        >
          {isEmpty(selectWorkload) ? (
            <WorkloadAddCard
              onClick={() => {
                onWorkloadAdd?.();
              }}
            ></WorkloadAddCard>
          ) : (
            <WorkloadContainer>
              <Row columns={24}>
                <Col span={6}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Backup size={40}></Backup>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <span style={{ fontWeight: 600 }}>{selectWorkload.name}</span>
                      <Description>
                        {t('hpa.common.updateAt')}{' '}
                        {getLocalTime(selectWorkload.updateTime).format('YYYY-MM-DD HH:mm:ss')}
                      </Description>
                    </div>
                  </div>
                </Col>
                <Col span={6}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 600 }}>{selectWorkload.kind}</span>
                    <Description>{t('hpa.common.type')}</Description>
                  </div>
                </Col>
                <Col span={6}>
                  <WorkloadStatus
                    workloadItem={selectWorkload}
                    module={
                      WORKLOAD_KIND_MAP[selectWorkload.kind as keyof typeof WORKLOAD_KIND_MAP]
                    }
                  />
                  <Description>{t('hpa.common.status')}</Description>
                </Col>
                {isEmpty(extraParams.workloadDetail) ? (
                  <Col span={6}>
                    <ActionContainer>
                      <Button
                        variant="text"
                        onClick={(e: MouseEvent<HTMLButtonElement>) => {
                          e.preventDefault();
                          updateSelectWorkload(null);
                        }}
                      >
                        <Trash size={16}></Trash>
                      </Button>
                      <Button
                        variant="text"
                        onClick={(e: MouseEvent<HTMLButtonElement>) => {
                          e.preventDefault();
                          onWorkloadAdd?.();
                        }}
                      >
                        <Pen size={16}></Pen>
                      </Button>
                    </ActionContainer>
                  </Col>
                ) : null}
              </Row>
            </WorkloadContainer>
          )}
        </FormItem>
      </Form>
    </div>
  );
};

const CreateBasicInfoForm = forwardRef(BaseForm);

export { CreateBasicInfoForm };
