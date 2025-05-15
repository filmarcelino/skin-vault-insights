
// Format utilities for the application

/**
 * Format a number as a currency based on the provided currency code
 */
export function formatCurrencyValue(value: number, currencyCode = 'USD'): string {
  if (value === undefined || value === null) return '-';
  
  try {
    const formatter = new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    
    return formatter.format(value);
  } catch (error) {
    console.error(`Error formatting currency: ${error}`);
    return `${value} ${currencyCode}`;
  }
}

/**
 * Format a date string into a localized date
 */
export function formatDate(dateString: string | Date): string {
  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString();
  } catch (error) {
    return 'Invalid date';
  }
}

/**
 * Format a percentage value with % symbol
 */
export function formatPercentage(value: number, decimals = 2): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format a number with thousand separators
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat().format(value);
}

/**
 * Alias for formatCurrencyValue for backward compatibility
 */
export function formatCurrency(value: number, currencyCode = 'USD'): string {
  return formatCurrencyValue(value, currencyCode);
}

/**
 * Format price for display (alias for formatCurrencyValue)
 */
export function formatPrice(value: number, currencyCode = 'USD'): string {
  return formatCurrencyValue(value, currencyCode);
}
