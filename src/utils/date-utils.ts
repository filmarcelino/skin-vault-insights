
/**
 * Utility functions for date formatting and manipulation
 */

/**
 * Format a date string to a localized format
 * @param dateStr ISO date string or Date object
 * @param locale Locale for formatting (defaults to 'en-US')
 * @returns Formatted date string
 */
export const formatDateString = (dateStr: string | Date | null | undefined, locale = 'en-US'): string => {
  if (!dateStr) return 'N/A';
  
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  
  // Check if date is valid
  if (isNaN(date.getTime())) return 'Invalid Date';
  
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Check if a date is in the past
 * @param date Date to check
 * @returns Boolean indicating if date is in the past
 */
export const isDateInPast = (date: string | Date | null | undefined): boolean => {
  if (!date) return false;
  
  const dateObject = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  
  return dateObject < now;
};

/**
 * Calculate days remaining until a future date
 * @param futureDate Future date
 * @returns Number of days remaining, or 0 if date is in the past
 */
export const daysRemaining = (futureDate: string | Date | null | undefined): number => {
  if (!futureDate) return 0;
  
  const date = typeof futureDate === 'string' ? new Date(futureDate) : futureDate;
  const now = new Date();
  
  if (date <= now) return 0;
  
  const diffTime = Math.abs(date.getTime() - now.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};
