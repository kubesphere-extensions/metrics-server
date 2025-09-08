import React, { useCallback } from 'react';
import { useBatchDeleteMutation } from '../data/useBatchDeleteMutation';
import { useModal, notify } from '@kubed/components';
import { DeleteConfirmContent, PathParams } from '@ks-console/shared';
interface DelProps {
  type?: string;
  resource?: any | any[];
  onOk?: () => void;
  onCancel?: () => void;
  onSuccess?: () => void;
  [key: string]: any;
}

export const useDelete = () => {
  const modal = useModal();

  const { mutateAsync: batchDelete } = useBatchDeleteMutation();

  const deleteHpa = useCallback(async (props: DelProps) => {
    const { type, resource, onOk, onSuccess, onCancel = () => {}, ...rest } = props;
    const items = resource
      ? Array.isArray(resource)
        ? resource
        : [resource]
      : Array.isArray(props)
        ? props
        : [props];

    const handleOk = async () => {
      const deleteParams = items.map(item => ({
        namespace: item.namespace,
        name: item.name,
        cluster: item.cluster,
        k8sVersion: globals.clusterConfig?.[item.cluster!]?.k8sVersion,
      }));

      await batchDelete(deleteParams);
      notify.success(t('DELETED_SUCCESSFULLY'));
      onSuccess?.();
    };

    const modalId = modal.open({
      header: null,
      footer: null,
      closable: false,
      width: 504,
      content: (
        <DeleteConfirmContent
          onOk={onOk || handleOk}
          resource={items}
          type={type}
          onCancel={() => {
            onCancel();
            modal.close(modalId);
          }}
          {...rest}
        />
      ),
    });
  }, []);

  return { deleteHpa };
};
