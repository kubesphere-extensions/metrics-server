import { get, isArray, isEmpty, last } from 'lodash';

const UnitTypes: Record<string, any> = {
  second: {
    conditions: [0.01, 0],
    units: ['s', 'ms'],
  },
  cpu: {
    conditions: [0.1, 0],
    units: ['core', 'm'],
  },
  memory: {
    conditions: [1024 ** 4, 1024 ** 3, 1024 ** 2, 1024, 0],
    units: ['Ti', 'Gi', 'Mi', 'Ki', 'Bytes'],
  },
  disk: {
    conditions: [1000 ** 4, 1000 ** 3, 1000 ** 2, 1000, 0],
    units: ['TB', 'GB', 'MB', 'KB', 'Bytes'],
  },
  throughput: {
    conditions: [1000 ** 4, 1000 ** 3, 1000 ** 2, 1000, 0],
    units: ['TB/s', 'GB/s', 'MB/s', 'KB/s', 'B/s'],
  },
  traffic: {
    conditions: [1000 ** 4, 1000 ** 3, 1000 ** 2, 1000, 0],
    units: ['TB/s', 'GB/s', 'MB/s', 'KB/s', 'B/s'],
  },
  bandwidth: {
    conditions: [1024 ** 2 / 8, 1024 / 8, 0],
    units: ['Mbps', 'Kbps', 'bps'],
  },
  number: {
    conditions: [1000 ** 4, 1000 ** 3, 1000 ** 2, 1000, 0],
    units: ['T', 'G', 'M', 'K', ''],
  },
};
export const getSuitableUnit = (value: string, unitType: string): string => {
  const config = UnitTypes[unitType];

  if (isEmpty(config)) return '';

  // value can be an array or a single value
  const values = isArray(value) ? value : [[0, Number(value)]];
  let result: string = last(config.units) || '';
  config.conditions.some((condition: number, index: number) => {
    const triggered = values.some(
      _value => ((isArray(_value) ? get(_value, '[1]') : Number(_value)) || 0) >= condition,
    );

    if (triggered) {
      result = config.units[index];
    }
    return triggered;
  });
  return result;
};

export const getValueByUnit = (
  num: string,
  unit: string,
  precision?: number,
  originalUnit?: string,
) => {
  precision = precision || 2;
  let value = num === 'NAN' ? 0 : parseFloat(num);

  if (originalUnit !== unit) {
    switch (unit) {
      default:
        break;
      case '':
      case 'default':
        return value;
      case 'iops':
        return Math.round(value);
      case '%':
        value *= 100;
        break;
      case 'm':
        value *= 1000;
        if (value < 1) return 0;
        break;
      case 'Ki':
        value /= 1024;
        break;
      case 'Mi':
        value /= 1024 ** 2;
        break;
      case 'Gi':
        value /= 1024 ** 3;
        break;
      case 'Ti':
        value /= 1024 ** 4;
        break;
      case 'Bytes':
      case 'B':
      case 'B/s':
        break;
      case 'K':
      case 'KB':
      case 'KB/s':
        value /= 1000;
        break;
      case 'M':
      case 'MB':
      case 'MB/s':
        value /= 1000 ** 2;
        break;
      case 'G':
      case 'GB':
      case 'GB/s':
        value /= 1000 ** 3;
        break;
      case 'T':
      case 'TB':
      case 'TB/s':
        value /= 1000 ** 4;
        break;
      case 'bps':
        value *= 8;
        break;
      case 'Kbps':
        value = (value * 8) / 1024;
        break;
      case 'Mbps':
        value = (value * 8) / 1024 / 1024;
        break;
      case 'ms':
        value *= 1000;
        break;
    }
  }

  return Number(value) === 0 ? 0 : Number(value.toFixed(precision));
};

export const coreUnitTS = (value: number, unit: string) => {
  let unitTxt = unit || '';

  if (unit === 'core') {
    unitTxt = value !== 1 ? t('CORE_PL') : t('CORE');
  }

  return unitTxt;
};

export const transformBytes = (value: number) => {
  const units = ['Bytes', 'Ki', 'Mi', 'Gi', 'Ti'];
  const base = 1024;
  let index = 0;

  // Continue conversion while value >= 1024 and there are larger units available
  while (value >= base && index < units.length - 1) {
    value /= base;
    index++;
  }

  // For very small values (less than 1), return 0
  if (value < 1 && index === 0) {
    return '0';
  }

  return `${value.toFixed(2)}${units[index]}`;
};

// Supported binary SI units (base 1024)
type BinarySIUnit = 'Ki' | 'Mi' | 'Gi' | 'Ti' | 'Pi' | 'Ei';

// Supported decimal SI units (base 1000)
type DecimalSIUnit = 'm' | '' | 'k' | 'M' | 'G' | 'T' | 'P' | 'E';

// All supported units
type Unit = BinarySIUnit | DecimalSIUnit;

// Converts a Kubernetes Quantity string (memory in bytes) to a value in Mi (Mebibytes, 2^20).
// Supports binarySI (Ki, Mi, Gi, etc.) and decimalSI (m, k, M, etc.).
export function quantityToMi(quantity?: string): { value: number; stringValue: string } {
  if (!quantity) {
    return { value: 0, stringValue: '0Mi' };
  }
  // Regular expression to match number and suffix
  const regex = /^([-+]?[0-9]*\.?[0-9]+(?:[eE][-+]?[0-9]+)?)?([a-zA-Z]*)$/;
  const match = quantity?.toString().match(regex);
  if (!match) {
    console.error(`Invalid quantity format: ${quantity}`);
    return { value: 0, stringValue: '0Mi' };
  }

  // Extract number and suffix
  const number: number = match[1] ? parseFloat(match[1]) : 1; // Default to 1 if no number
  const suffix: Unit = (match[2] || '') as Unit;

  // Binary SI units (base 1024)
  const binarySI: Record<BinarySIUnit, number> = {
    Ki: Math.pow(2, 10), // 1024
    Mi: Math.pow(2, 20), // 1024^2
    Gi: Math.pow(2, 30), // 1024^3
    Ti: Math.pow(2, 40), // 1024^4
    Pi: Math.pow(2, 50), // 1024^5
    Ei: Math.pow(2, 60), // 1024^6,
  };

  // Decimal SI units (base 1000)
  const decimalSI: Record<DecimalSIUnit, number> = {
    m: Math.pow(10, -3), // 0.001
    '': 1, // No suffix
    k: Math.pow(10, 3), // 1000
    M: Math.pow(10, 6), // 1000^2
    G: Math.pow(10, 9), // 1000^3
    T: Math.pow(10, 12), // 1000^4
    P: Math.pow(10, 15), // 1000^5
    E: Math.pow(10, 18), // 1000^6
  };

  let valueInBytes: number;

  // Handle binary SI units
  if (suffix in binarySI) {
    valueInBytes = number * binarySI[suffix as BinarySIUnit];
  }
  // Handle decimal SI units
  else if (suffix in decimalSI) {
    valueInBytes = number * decimalSI[suffix as DecimalSIUnit];
  } else {
    console.error(`Unknown suffix: ${suffix}`);
    return { value: 0, stringValue: '0Mi' };
  }

  // Convert to Mi (divide by 2^20)
  const valueInMi: number = valueInBytes / binarySI.Mi;

  // Avoid rounding to 0 for very small values
  if (Math.abs(valueInMi) < 0.000001 && valueInMi !== 0) {
    return {
      value: parseFloat(valueInMi.toExponential(3)),
      stringValue: `${valueInMi.toExponential(3)}Mi`,
    };
  }

  // Format output: use 6 decimal places for small values, 3 for larger values
  const formattedValue: string = valueInMi >= 1 ? valueInMi.toFixed(3) : valueInMi.toFixed(6);
  // Remove trailing zeros and unnecessary decimal point
  const cleanValue: number = parseFloat(formattedValue);
  return {
    value: cleanValue,
    stringValue: `${cleanValue}Mi`,
  };
}

interface Metric {
  type: string;
  resource: {
    name: string;
    target?: {
      type?: string;
      averageUtilization?: number;
      averageValue?: string;
    };
    current?: {
      averageValue?: string;
      averageUtilization?: number;
    };
  };
}

export const findTargetMetric = (metrics?: Metric[], name?: string) =>
  metrics?.find(m => m.type === 'Resource' && m.resource.name === name)?.resource;
export const findCurrentMetric = (metrics?: Metric[], name?: string) =>
  metrics?.find(m => m.type === 'Resource' && m.resource.name === name)?.resource?.current;

/**
 * Extract target metric value based on configured type
 * @param metrics - Metrics array from spec
 * @param metricName - Metric name ('cpu' or 'memory')
 * @returns Target value (could be number for percentage or string for absolute value)
 */
export const getTargetMetricValue = (
  metrics?: Metric[],
  metricName?: string,
): string | number | undefined => {
  const metric = findTargetMetric(metrics, metricName);
  if (!metric?.target) return undefined;

  // Return averageUtilization (percentage) or averageValue (absolute value)
  return metric.target.averageUtilization ?? metric.target.averageValue;
};

/**
 * Extract current metric value based on target's configured type
 * Prioritize value that matches the target type
 * @param currentMetrics - Current metrics array from status
 * @param targetMetrics - Target metrics array from spec
 * @param metricName - Metric name ('cpu' or 'memory')
 * @returns Current value (type matches target type)
 */
export const getCurrentMetricValue = (
  currentMetrics?: Metric[],
  targetMetrics?: Metric[],
  metricName?: string,
): string | number | undefined => {
  const metric = findCurrentMetric(currentMetrics, metricName);
  if (!metric) return undefined;

  // Get target type to determine which current value to use
  const targetMetric = findTargetMetric(targetMetrics, metricName);
  const targetType = targetMetric?.target?.type;

  // If target type is Utilization, prefer averageUtilization
  if (targetType === 'Utilization') {
    return metric.averageUtilization ?? metric.averageValue;
  }

  // If target type is AverageValue, prefer averageValue
  if (targetType === 'AverageValue') {
    return metric.averageValue ?? metric.averageUtilization;
  }

  // Default: prefer averageUtilization
  return metric.averageUtilization ?? metric.averageValue;
};

// ============================================================================
// HPA Metrics Formatting Utility Functions
// ============================================================================

export type MetricTargetType = 'Utilization' | 'AverageValue' | '';

/**
 * Format CPU metric value
 * Display format is determined by the type configured in spec.metrics
 *
 * @param value - CPU value (could be number, string, or undefined)
 * @param targetType - Configured target type ('Utilization' or 'AverageValue')
 * @returns Formatted display string
 *
 * @example
 * formatCpuMetricValue(80, 'Utilization')        // => "80%"
 * formatCpuMetricValue("100m", 'AverageValue')   // => "100m"
 * formatCpuMetricValue(0, 'Utilization')         // => "0%"
 * formatCpuMetricValue(undefined, '')            // => "--"
 */
export const formatCpuMetricValue = (
  value: string | number | undefined,
  targetType: MetricTargetType,
): string => {
  // Handle empty values (note that 0 is a valid value)
  if (!value && value !== 0) return '--';

  // If configured as Utilization type, display as percentage
  if (targetType === 'Utilization') {
    return `${value}%`;
  }

  // If configured as AverageValue type, display directly (e.g., "100m")
  if (targetType === 'AverageValue') {
    return String(value);
  }

  // If no type configured, return original value
  return value ? String(value) : '--';
};

/**
 * Format Memory metric value
 * Display format is determined by the type configured in spec.metrics
 *
 * @param value - Memory value (could be number, string, or undefined)
 * @param targetType - Configured target type ('Utilization' or 'AverageValue')
 * @returns Formatted display string
 *
 * @example
 * formatMemoryMetricValue(80, 'Utilization')     // => "80%"
 * formatMemoryMetricValue("1Gi", 'AverageValue') // => "1024Mi"
 * formatMemoryMetricValue("1024", 'AverageValue')// => "0.98Mi"
 * formatMemoryMetricValue(75, 'AverageValue')    // => "71.53Mi" (fallback value also converted)
 * formatMemoryMetricValue(undefined, '')         // => "--"
 */
export const formatMemoryMetricValue = (
  value: string | number | undefined,
  targetType: MetricTargetType,
): string => {
  // Handle empty values (note that 0 is a valid value)
  if (!value && value !== 0) return '--';

  // If configured as Utilization type, display as percentage
  if (targetType === 'Utilization') {
    return `${value}%`;
  }

  // If configured as AverageValue type, convert to Mi format
  if (targetType === 'AverageValue') {
    // If already a string (with unit), convert to Mi
    if (typeof value === 'string') {
      return quantityToMi(value).stringValue;
    }
    // If a number, also convert to Mi (could be a utilization value from current fallback)
    return quantityToMi(String(value)).stringValue;
  }

  // If no type configured, return original value
  return value ? String(value) : '--';
};
