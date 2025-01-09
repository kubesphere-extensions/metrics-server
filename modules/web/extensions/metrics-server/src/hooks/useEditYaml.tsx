import React from 'react';
import { Pen } from '@kubed/icons';
import { yaml, PathParams } from '@ks-console/shared';
import { useModal, notify } from '@kubed/components';
import { CodeEditor, CodeEditorRef } from '@kubed/code-editor';
import { useEditYamlMutation } from '../data/useEditYamlMutation';

interface EditYamlProps {
  initialValues?: any;
  onSuccess?: () => void;
}

export function useEditYaml(params: PathParams) {
  const codeEditorRef = React.useRef<CodeEditorRef>(null);
  const modal = useModal();

  const { mutateAsync: updateYaml } = useEditYamlMutation(params);

  const editYaml = React.useCallback(
    (props: EditYamlProps) => {
      let { initialValues, onSuccess } = props;

      if (!initialValues) initialValues = props;

      const yamlValue = yaml.getValue(initialValues._originData || initialValues);

      modal.open({
        title: t('EDIT_YAML'),
        titleIcon: <Pen />,
        content: (
          <CodeEditor
            ref={codeEditorRef}
            mode="yaml"
            acceptFileTypes={['.yaml', '.yml']}
            fileName="config.yaml"
            readOnly={false}
            value={yamlValue}
          />
        ),
        footer: undefined,
        className: 'modal-fullscreen',
        width: 'calc(100vw - 40px)',
        bodyStyle: { padding: '20px', height: 'calc(100vh - 170px)' },
        onAsyncOk: async () => {
          const newYaml = codeEditorRef.current?.getValue?.();
          try {
            await updateYaml({
              name: initialValues.metadata.name,
              value: newYaml ?? '',
            });
            onSuccess?.();
            return true;
          } catch (error) {
            console.error('YAML update failed:', error);
            notify.error(t('UPDATE_FAILED'));
            return false;
          }
        },
      });
    },
    [params, updateYaml],
  );

  return {
    editYaml,
  };
}
