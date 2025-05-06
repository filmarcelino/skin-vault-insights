
import { useState } from 'react';

export const useViewMode = (defaultMode: 'grid' | 'list' = 'grid') => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(defaultMode);
  
  return {
    viewMode,
    setViewMode
  };
};
