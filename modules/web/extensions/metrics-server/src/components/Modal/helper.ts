const convertMetrics = (formMetrics: Record<string, any>) => {
  // if formMetrics.cpu.value is not empty, add cpu metric
  if (formMetrics.cpu.value && !formMetrics.memory.value) {
    return [
      {
        type: 'Resource',
        resource: {
          name: formMetrics.cpu.name,
          target: {
            type: formMetrics.cpu.type,
            [`${formMetrics.cpu.type === 'Utilization' ? 'averageUtilization' : 'averageValue'}`]:
              formMetrics.cpu.value,
          },
        },
      },
    ];
  }
  // if formMetrics.memory.value is not empty, add memory metric
  if (formMetrics.memory.value && !formMetrics.cpu.value) {
    return [
      {
        type: 'Resource',
        resource: {
          name: formMetrics.memory.name,
          target: {
            type: formMetrics.memory.type,
            [`${formMetrics.memory.type === 'Utilization' ? 'averageUtilization' : 'averageValue'}`]:
              formMetrics.memory.type === 'Utilization'
                ? formMetrics.memory.value
                : formMetrics.memory.value + 'Mi',
          },
        },
      },
    ];
  }
  // if formMetrics.cpu.value and formMetrics.memory.value are both not empty
  if (formMetrics.cpu.value && formMetrics.memory.value) {
    return [
      {
        type: 'Resource',
        resource: {
          name: formMetrics.cpu.name,
          target: {
            type: formMetrics.cpu.type,
            [`${formMetrics.cpu.type === 'Utilization' ? 'averageUtilization' : 'averageValue'}`]:
              formMetrics.cpu.value,
          },
        },
      },
      {
        type: 'Resource',
        resource: {
          name: formMetrics.memory.name,
          target: {
            type: formMetrics.memory.type,
            [`${formMetrics.memory.type === 'Utilization' ? 'averageUtilization' : 'averageValue'}`]:
              formMetrics.memory.type === 'Utilization'
                ? formMetrics.memory.value
                : formMetrics.memory.value + 'Mi',
          },
        },
      },
    ];
  }
  return [];
};

export { convertMetrics };
