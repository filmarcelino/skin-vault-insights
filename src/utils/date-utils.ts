
/**
 * Returns the current date as a string in ISO format
 */
export const getCurrentDateAsString = (): string => {
  return new Date().toISOString();
};

/**
 * Formats a date as a readable string
 */
export const formatDateString = (dateString: string): string => {
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  };
  
  return new Date(dateString).toLocaleDateString(undefined, options);
};

/**
 * Calculates the number of days between today and a given date
 */
export const daysSince = (dateString: string): number => {
  const date = new Date(dateString);
  const today = new Date();
  const diffTime = today.getTime() - date.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};
