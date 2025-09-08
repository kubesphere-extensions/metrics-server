import React, { useState } from 'react';
import { CodeEditor } from '@kubed/code-editor';
import { yaml, IHpaDetail, BasePathParams } from '@ks-console/shared';
import { useEditMutation } from '../../data/useEditMutation';
import { Modal, notify } from '@kubed/components';
import styled from 'styled-components';
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

const HpaYamlModal = ({ hpaDetail, params, onOk, onCancel, open }: HpaFormModalProps) => {
  const { cluster, namespace } = params;
  const { name } = hpaDetail;
  const [yamlValue, setYamlValue] = useState(yaml.getValue(hpaDetail?._originData));
  const { mutate: patchHpa } = useEditMutation({
    cluster,
    name,
    namespace,
  });
  const onFinish = () => {
    patchHpa(yaml.load(yamlValue), {
      onSuccess: () => {
        onOk?.();
        notify.success(t('hpa.common.updateSuccess'));
      },
    });
  };
  return (
    <Modal
      width={'calc(100vw - 40px)'}
      title={t('hpa.common.editYaml')}
      visible={open}
      onCancel={onCancel}
      onOk={onFinish}
    >
      <HpaFormWrapper>
        <CodeEditor
          onChange={value => {
            setYamlValue(value);
          }}
          mode="yaml"
          height="100%"
          style={{ height: 'calc(100% - 12px)' }}
          value={yamlValue}
        />
      </HpaFormWrapper>
    </Modal>
  );
};

export { HpaYamlModal };
