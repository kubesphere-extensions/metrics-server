import React from 'react';
import { Form, FormItem, Input, Modal, useForm, notify } from '@kubed/components';
import { BasePathParams, IHpaDetail } from '@ks-console/shared';
import styled from 'styled-components';
import { merge, omit } from 'lodash';
import { useEditMutation } from '../../../data/useEditMutation';

type HpaFormModalProps = {
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

export const HpaEditModal = (props: HpaFormModalProps) => {
  const { params, onOk, onCancel, open, hpaDetail } = props;

  const { cluster, namespace } = params;
  const { name } = hpaDetail;

  const initialFormData = merge({}, hpaDetail?._originData, {});

  const { mutate: patchHpa } = useEditMutation({
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

  const onEdit = (formValues: any) => {
    const finalFormValues = omit(formValues, ['metadata.ownerReferences', 'spec.scaleTargetRef']);
    patchHpa(finalFormValues, {
      onSuccess: () => {
        onOk();
        form.resetFields();
        notify.success(t('hpa.common.updateSuccess'));
      },
    });
  };

  return (
    <Modal
      title={t('hpa.common.editBaseInfo')}
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
              label={t('hpa.common.name')}
              name={['metadata', 'name']}
              rules={[{ required: true }]}
            >
              <Input disabled />
            </FormItem>
            <FormItem
              label={t('hpa.common.aliasName')}
              help={t('hpa.common.aliasName.help')}
              name={['metadata', 'annotations', 'kubesphere.io/alias-name']}
            >
              <Input />
            </FormItem>
            <FormItem
              label={t('hpa.common.description')}
              help={t('hpa.common.description.help')}
              name={['metadata', 'annotations', 'kubesphere.io/description']}
            >
              <Input />
            </FormItem>
          </Form>
        </HpaFormInner>
      </HpaFormWrapper>
    </Modal>
  );
};
