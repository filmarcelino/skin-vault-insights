
/**
 * Utility functions for safely handling type conversions
 */

/**
 * Safely convert any value to string
 * @param value Any value to convert
 * @param defaultValue Optional default value if value is null/undefined
 * @returns A string representation of the value
 */
export const safeString = (value: unknown, defaultValue: string = ''): string => {
  if (value === null || value === undefined) return defaultValue;
  return String(value);
};

/**
 * Safely convert any value to boolean
 * @param value Any value to convert
 * @param defaultValue Optional default value if value is null/undefined
 * @returns A boolean representation of the value
 */
export const safeBoolean = (value: unknown, defaultValue: boolean = false): boolean => {
  if (value === null || value === undefined) return defaultValue;
  if (typeof value === 'boolean') return value;
  if (value === 'true') return true;
  if (value === 1 || value === '1') return true;
  if (value === 'false') return false;
  if (value === 0 || value === '0') return false;
  return Boolean(value);
};

/**
 * Safely convert any value to number
 * @param value Any value to convert
 * @param defaultValue Optional default value if value is null/undefined or NaN
 * @returns A number representation of the value
 */
export const safeNumber = (value: unknown, defaultValue: number = 0): number => {
  if (value === null || value === undefined) return defaultValue;
  const num = Number(value);
  return isNaN(num) ? defaultValue : num;
};

/**
 * Safely get a property from an object
 * @param obj Object to get property from
 * @param property Property name
 * @param defaultValue Default value if property doesn't exist
 * @returns The property value or default value
 */
export const safeGetProperty = <T>(obj: any | null, property: string, defaultValue: T): T => {
  if (!obj || typeof obj !== 'object' || !(property in obj)) {
    return defaultValue;
  }
  const value = obj[property as keyof typeof obj];
  return (value === null || value === undefined) ? defaultValue : value as T;
};
