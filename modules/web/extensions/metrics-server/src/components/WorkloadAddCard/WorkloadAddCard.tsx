import React from 'react';
import { AddButton, CardTitle, CardDescription } from './styles';

const WorkloadAddCard = ({ onClick }: { onClick: () => void }) => {
  return (
    <AddButton
      onClick={() => {
        onClick();
      }}
    >
      <CardTitle>{t('hpa.scaleTarget.create.title')}</CardTitle>
      <CardDescription>{t('hpa.scaleTarget.create.description')}</CardDescription>
    </AddButton>
  );
};

export { WorkloadAddCard };
