import React from 'react';
import { PrefixInputWrapper, PreFixLabel, Unit } from './styles';
type PrefixInputProps = {
  label: string;
  children?: React.ReactNode;
  unit?: string;
};
const PrefixInput = ({ label, children, unit }: PrefixInputProps) => {
  return (
    <PrefixInputWrapper>
      <>
        <PreFixLabel>{label}</PreFixLabel>
        {children}
        {unit && <Unit>{unit}</Unit>}
      </>
    </PrefixInputWrapper>
  );
};

export { PrefixInput };
