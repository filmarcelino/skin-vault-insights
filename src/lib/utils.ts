
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Safely extracts a string from an unknown value, with fallback
 * @param value Potentially unknown value
 * @param fallback Fallback value
 * @returns Safe string value
 */
export function safeString(value: unknown, fallback: string = ''): string {
  if (typeof value === 'string') return value;
  if (value === null || value === undefined) return fallback;
  return String(value);
}

/**
 * Safely extracts a number from an unknown value, with fallback
 * @param value Potentially unknown value
 * @param fallback Fallback value
 * @returns Safe number value
 */
export function safeNumber(value: unknown, fallback: number = 0): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? fallback : parsed;
  }
  return fallback;
}

/**
 * Safely extracts a boolean from an unknown value, with fallback
 * @param value Potentially unknown value
 * @param fallback Fallback value
 * @returns Safe boolean value
 */
export function safeBoolean(value: unknown, fallback: boolean = false): boolean {
  return Boolean(value ?? fallback);
}

