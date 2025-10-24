// ============================================================================
// Type Definitions
// ============================================================================

/** Metric target type */
type MetricType = 'Utilization' | 'AverageValue';

/** Resource name */
type ResourceName = 'cpu' | 'memory';

/** Single metric configuration in form */
interface FormMetric {
  name: ResourceName;
  type: MetricType;
  value: number | string;
}

/** Metrics configuration in form */
interface FormMetrics {
  cpu: FormMetric;
  memory: FormMetric;
}

/** Kubernetes MetricSpec structure */
interface K8sMetricSpec {
  type: string;
  resource: {
    name: string;
    target: {
      type: string;
      averageUtilization?: number | string;
      averageValue?: string;
    };
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Convert a single FormMetric to Kubernetes MetricSpec
 *
 * @param metric - Single metric configuration from form
 * @returns K8s MetricSpec object, or null if value is empty
 *
 * @example
 * convertSingleMetric({ name: 'cpu', type: 'Utilization', value: 80 })
 * // => { type: 'Resource', resource: { name: 'cpu', target: { type: 'Utilization', averageUtilization: 80 } } }
 */
const convertSingleMetric = (metric: FormMetric): K8sMetricSpec | null => {
  // Skip this metric if no value is set
  if (!metric.value && metric.value !== 0) {
    return null;
  }

  // Determine which field name to use based on type
  const isUtilization = metric.type === 'Utilization';
  const fieldName = isUtilization ? 'averageUtilization' : 'averageValue';

  let value: number | string = metric.value;

  // Add units for AverageValue type
  // According to K8s docs, averageValue is a Quantity type and requires units
  if (!isUtilization) {
    if (metric.name === 'cpu') {
      // CPU: millicores (m)
      value = `${metric.value}m`;
    } else if (metric.name === 'memory') {
      // Memory: Mebibytes (Mi)
      value = `${metric.value}Mi`;
    }
  }

  return {
    type: 'Resource',
    resource: {
      name: metric.name,
      target: {
        type: metric.type,
        [fieldName]: value,
      },
    },
  };
};

/**
 * Convert FormMetrics to Kubernetes metrics array
 *
 * @param formMetrics - Metrics configuration from form
 * @returns K8s metrics array
 *
 * @example
 * convertMetrics({
 *   cpu: { name: 'cpu', type: 'Utilization', value: 80 },
 *   memory: { name: 'memory', type: 'AverageValue', value: 1024 }
 * })
 * // => [
 * //   { type: 'Resource', resource: { name: 'cpu', target: { type: 'Utilization', averageUtilization: 80 } } },
 * //   { type: 'Resource', resource: { name: 'memory', target: { type: 'AverageValue', averageValue: '1024Mi' } } }
 * // ]
 */
const convertMetrics = (formMetrics: FormMetrics): K8sMetricSpec[] => {
  const metrics = [
    convertSingleMetric(formMetrics.cpu),
    convertSingleMetric(formMetrics.memory),
  ].filter((metric): metric is K8sMetricSpec => metric !== null);

  return metrics;
};

// ============================================================================
// Reverse Conversion Functions
// ============================================================================

/**
 * Extract metric value from Kubernetes MetricSpec
 *
 * @param metric - K8s MetricSpec object
 * @returns Extracted value, or empty string if not found
 *
 * @example
 * extractMetricValue({ type: 'Resource', resource: { name: 'cpu', target: { type: 'Utilization', averageUtilization: 80 } } })
 * // => 80
 *
 * extractMetricValue({ type: 'Resource', resource: { name: 'memory', target: { type: 'AverageValue', averageValue: '1024Mi' } } })
 * // => 1024
 */
const extractMetricValue = (metric: any): number | string => {
  if (!metric?.resource?.target) {
    return '';
  }

  const target = metric.resource.target;
  const rawValue = target.averageUtilization || target.averageValue || '';

  // If it's AverageValue type, need to remove units
  if (target.type === 'AverageValue' && typeof rawValue === 'string') {
    if (metric.resource.name === 'memory') {
      // Memory: use quantityToMi for conversion
      // This function is defined in utils/index.ts and will be imported in components
      return rawValue;
    } else if (metric.resource.name === 'cpu') {
      // CPU: remove 'm' unit
      const match = rawValue.match(/^(\d+(?:\.\d+)?)m?$/);
      return match ? parseFloat(match[1]) : rawValue;
    }
  }

  return rawValue;
};

/**
 * Convert Kubernetes metrics array back to FormMetrics
 *
 * @param metrics - K8s metrics array
 * @returns FormMetrics object
 *
 * @example
 * convertToFormMetrics([
 *   { type: 'Resource', resource: { name: 'cpu', target: { type: 'Utilization', averageUtilization: 80 } } }
 * ])
 * // => {
 * //   cpu: { name: 'cpu', type: 'Utilization', value: 80 },
 * //   memory: { name: 'memory', type: 'Utilization', value: '' }
 * // }
 */
const convertToFormMetrics = (metrics: any[] = []): FormMetrics => {
  const cpuMetric = metrics.find(m => m.resource?.name === 'cpu');
  const memoryMetric = metrics.find(m => m.resource?.name === 'memory');

  return {
    cpu: {
      name: 'cpu',
      type: (cpuMetric?.resource?.target?.type as MetricType) || 'Utilization',
      value: extractMetricValue(cpuMetric),
    },
    memory: {
      name: 'memory',
      type: (memoryMetric?.resource?.target?.type as MetricType) || 'AverageValue',
      value: extractMetricValue(memoryMetric),
    },
  };
};

// ============================================================================
// Validation Functions
// ============================================================================

/** Validation result */
interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate if FormMetrics is valid
 *
 * @param formMetrics - Metrics configuration from form
 * @returns Validation result object
 *
 * @example
 * validateFormMetrics({
 *   cpu: { name: 'cpu', type: 'Utilization', value: '' },
 *   memory: { name: 'memory', type: 'Utilization', value: '' }
 * })
 * // => { valid: false, error: 'hpa.validation.metrics.required' }
 *
 * validateFormMetrics({
 *   cpu: { name: 'cpu', type: 'Utilization', value: 150 },
 *   memory: { name: 'memory', type: 'Utilization', value: '' }
 * })
 * // => { valid: false, error: 'hpa.validation.cpu.utilization.range' }
 */
const validateFormMetrics = (formMetrics: FormMetrics): ValidationResult => {
  const hasCpu = !!formMetrics.cpu.value && formMetrics.cpu.value !== 0;
  const hasMemory = !!formMetrics.memory.value && formMetrics.memory.value !== 0;

  // At least one metric must be set
  if (!hasCpu && !hasMemory) {
    return {
      valid: false,
      error: 'hpa.validation.metrics.required',
    };
  }

  // Validate CPU Utilization range (0-100)
  if (hasCpu && formMetrics.cpu.type === 'Utilization') {
    const value = Number(formMetrics.cpu.value);
    if (isNaN(value) || value <= 0 || value > 100) {
      return {
        valid: false,
        error: 'hpa.validation.cpu.utilization.range',
      };
    }
  }

  // Validate CPU AverageValue range (must be positive)
  if (hasCpu && formMetrics.cpu.type === 'AverageValue') {
    const value = Number(formMetrics.cpu.value);
    if (isNaN(value) || value <= 0) {
      return {
        valid: false,
        error: 'hpa.validation.cpu.averageValue.positive',
      };
    }
  }

  // Validate Memory Utilization range (0-100)
  if (hasMemory && formMetrics.memory.type === 'Utilization') {
    const value = Number(formMetrics.memory.value);
    if (isNaN(value) || value <= 0 || value > 100) {
      return {
        valid: false,
        error: 'hpa.validation.memory.utilization.range',
      };
    }
  }

  // Validate Memory AverageValue range (must be positive)
  if (hasMemory && formMetrics.memory.type === 'AverageValue') {
    const value = Number(formMetrics.memory.value);
    if (isNaN(value) || value <= 0) {
      return {
        valid: false,
        error: 'hpa.validation.memory.averageValue.positive',
      };
    }
  }

  return { valid: true };
};

export { convertMetrics, convertToFormMetrics, validateFormMetrics };
export type { MetricType, ResourceName, FormMetric, FormMetrics, K8sMetricSpec, ValidationResult };
