import React, { createContext, useContext } from 'react';
import { HpaData } from '../stores/hpaStore';
import { PartialDeep } from 'type-fest';

type HpaContextType = {
  hpaData: HpaData;
  updateHpaData: (newData: PartialDeep<HpaData>) => void;
  extraParams: Record<string, any>;
  formMetrics: Record<string, any>;
  updateFormMetrics: (newData: PartialDeep<Record<string, any>>) => void;
  selectWorkload: any;
  updateSelectWorkload: (newData: any) => void;
};

const HpaContext = createContext<HpaContextType | undefined>(undefined);

export const HpaProvider: React.FC<
  {
    children: React.ReactNode;
  } & HpaContextType
> = ({
  children,
  hpaData,
  extraParams,
  updateHpaData,
  formMetrics,
  updateFormMetrics,
  selectWorkload,
  updateSelectWorkload,
}) => {
  return (
    <HpaContext.Provider
      value={{
        hpaData,
        updateHpaData,
        extraParams,
        formMetrics,
        updateFormMetrics,
        selectWorkload,
        updateSelectWorkload,
      }}
    >
      {children}
    </HpaContext.Provider>
  );
};

export const useHpaContext = () => {
  const context = useContext(HpaContext);
  if (context === undefined) {
    throw new Error('useHPAContext must be used within a HPAProvider');
  }
  return context;
};
