
import { useState } from 'react';

export const useViewMode = (defaultMode: 'grid' | 'list' = 'grid') => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(defaultMode);
  
  const toggleViewMode = () => {
    setViewMode(prev => prev === 'grid' ? 'list' : 'grid');
  };
  
  return {
    viewMode,
    setViewMode,
    toggleViewMode
  };
};
