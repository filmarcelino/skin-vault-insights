
import { format, parseISO, formatDistanceToNow } from 'date-fns';

// Format currency based on user preference
export const formatPrice = (price: number | string, currency: string = 'USD'): string => {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  if (isNaN(numPrice)) return '$0.00';
  
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  
  return formatter.format(numPrice);
};

// Format date to YYYY-MM-DD
export const formatDateToYMD = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'yyyy-MM-dd');
};

// Format date to locale string
export const formatDateToLocale = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString();
};

// Format ISO date to readable format
export const formatISODate = (isoDate: string, formatStr: string = 'dd/MM/yyyy'): string => {
  try {
    return format(parseISO(isoDate), formatStr);
  } catch (error) {
    return '';
  }
};

// Format relative time (e.g. "2 days ago")
export const formatRelativeTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
};
