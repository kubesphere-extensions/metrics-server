import React from 'react';
import { Form, FormItem, Input, Modal, notify, useForm } from '@kubed/components';
import { BasePathParams, hpaStore, NumberInput } from '@ks-console/shared';
import styled from 'styled-components';
import { get } from 'lodash';

type HpaFormModalProps = {
  detail?: any;
  workloadStore?: any;
  params: BasePathParams;
  onOk: () => void;
  onCancel: () => void;
  open: boolean;
};

const HpaFormWrapper = styled.div`
  padding: 16px;
  padding-bottom: 0;
  border-radius: 4px;
  background-color: #f9fbfd;
`;

const HpaFormInner = styled.div`
  padding: 16px;
  border: 1px solid #d9dee4;
  background-color: ${props => props.theme.palette.background};
  border-radius: 4px;
`;

const { createHpa } = hpaStore;
export const HpaCreateModal = (props: HpaFormModalProps) => {
  const { detail, workloadStore, params, onOk, onCancel, open } = props;

  const { name, namespace } = params;
  const { uid, kind } = detail;
  const initialFormData = {
    metadata: {
      name,
      namespace,
      annotations: {
        cpuCurrentUtilization: '',
        cpuTargetUtilization: '',
        memoryCurrentValue: '',
        memoryTargetValue: '',
      },
      ownerReferences: [
        {
          apiVersion: 'apps/v1',
          blockOwnerDeletion: true,
          controller: true,
          kind,
          name,
          uid,
        },
      ],
    },
    spec: {
      minReplicas: 1,
      maxReplicas: 1,
      scaleTargetRef: {
        apiVersion: 'apps/v1',
        kind,
        name,
      },
    },
  };

  const { useUpdateDeploymentMutation } = workloadStore;

  const mutateUpdateDeploymentMutation = useUpdateDeploymentMutation({
    onSuccess: () => {
      notify.success(t('metricsServer.createSuccess'));
    },
  });

  const [form] = useForm();
  const onFinish = () => {
    form.validateFields().then(() => {
      const formValues = form.getFieldsValue(true);
      onCreate(formValues);
    });
  };

  const onCreate = async (formValues: any) => {
    await createHpa(detail, formValues);
    mutateUpdateDeploymentMutation.mutate({
      params: detail,
      data: {
        metadata: {
          annotations: {
            'kubesphere.io/relatedHPA': get(formValues, 'metadata.name', detail.name),
          },
        },
      },
    });
    onOk();
    form.resetFields();
  };
  return (
    <Modal
      title={t('metricsServer.modal.create.title')}
      visible={open}
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
      onOk={() => {
        onFinish();
      }}
    >
      <HpaFormWrapper>
        <HpaFormInner>
          <Form form={form} initialValues={initialFormData}>
            <FormItem
              label={t('metricsServer.resourceName')}
              name={['metadata', 'name']}
              rules={[{ required: true }]}
            >
              <Input />
            </FormItem>
            <FormItem
              label={t('metricsServer.namespace')}
              name={['metadata', 'namespace']}
              rules={[{ required: true }]}
            >
              <Input disabled />
            </FormItem>
            <FormItem
              label={t('metricsServer.targetCPUUsage')}
              help={t('metricsServer.targetCPUUsageDesc')}
              name={['metadata', 'annotations', 'cpuTargetUtilization']}
            >
              <NumberInput integer min={0} max={Infinity} defaultValue={''} />
            </FormItem>
            <FormItem
              label={t('metricsServer.targetMemoryUsage')}
              help={t('metricsServer.targetMemoryUsageDesc')}
              name={['metadata', 'annotations', 'memoryTargetValue']}
            >
              <NumberInput unit={'Mi'} min={0} max={Infinity} integer />
            </FormItem>
            <FormItem
              label={t('metricsServer.minimumReplicas')}
              help={t('metricsServer.minimumReplicasDesc')}
              name={['spec', 'minReplicas']}
            >
              <NumberInput defaultValue={'1'} min={1} max={Infinity} integer />
            </FormItem>
            <FormItem
              label={t('metricsServer.maximumReplicas')}
              help={t('metricsServer.maximumReplicasDesc')}
              name={['spec', 'maxReplicas']}
            >
              <NumberInput defaultValue={'1'} min={1} max={Infinity} integer />
            </FormItem>
          </Form>
        </HpaFormInner>
      </HpaFormWrapper>
    </Modal>
  );
};
