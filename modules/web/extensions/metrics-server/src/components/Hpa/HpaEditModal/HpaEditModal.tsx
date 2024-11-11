import React from 'react';
import { Form, FormItem, Input, Modal, useForm } from '@kubed/components';
import {
  BasePathParams,
  IHpaDetail,
  hpaStore,
  memoryFormat,
  NumberInput,
} from '@ks-console/shared';
import styled from 'styled-components';
import { merge } from 'lodash';

type HpaFormModalProps = {
  detail?: any;
  hpaDetail: IHpaDetail;
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

const { usePatchHpaMutation } = hpaStore;
export const HpaEditModal = (props: HpaFormModalProps) => {
  const { detail, params, onOk, onCancel, open, hpaDetail } = props;

  const { cluster, namespace } = params;
  const { uid, kind } = detail;
  const { name } = hpaDetail;
  const {
    cpuCurrentUtilization = '',
    cpuTargetUtilization = '',
    memoryCurrentValue = '',
    memoryTargetValue = '',
  } = hpaDetail;

  const initialFormData = merge({}, hpaDetail?._originData, {
    metadata: {
      name,
      namespace,
      annotations: {
        cpuCurrentUtilization,
        cpuTargetUtilization,
        memoryCurrentValue,
        memoryTargetValue: memoryTargetValue ? memoryFormat(memoryTargetValue, 'Mi') + '' : '',
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
      minReplicas: hpaDetail?.minReplicas ?? 1,
      maxReplicas: hpaDetail?.maxReplicas ?? 1,
      scaleTargetRef: {
        apiVersion: 'apps/v1',
        kind,
        name,
      },
    },
  });

  const { mutate: patchHpa } = usePatchHpaMutation({
    cluster,
    name,
    namespace,
  });

  const [form] = useForm();
  const onFinish = () => {
    form.validateFields().then(() => {
      const formValues = form.getFieldsValue(true);
      onEdit(formValues);
    });
  };

  const onEdit = async (formValues: any) => {
    await patchHpa(formValues);

    onOk();
    form.resetFields();
  };
  return (
    <Modal
      title={t('metricsServer.edit')}
      visible={open}
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
      onOk={() => {
        onFinish();
        onOk();
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
