import React from 'react';
import { CodeEditor } from '@kubed/code-editor';
import { yaml } from '@ks-console/shared';
import { useHpaContext } from '../../contexts/HpaContext';

const YamlEditor = () => {
  const { hpaData, updateHpaData } = useHpaContext();
  return (
    <div>
      <CodeEditor
        onChange={value => {
          updateHpaData(yaml.load(value));
        }}
        mode="yaml"
        height="100%"
        style={{ height: 'calc(100% - 12px)' }}
        value={yaml.getValue(hpaData)}
      />
    </div>
  );
};

export { YamlEditor };
