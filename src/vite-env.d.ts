
/// <reference types="vite/client" />

// Add debug helper to window object
interface Window {
  __DEBUG_INVENTORY?: {
    getItems: () => void;
    logItem: (item: any) => void;
    fixItem: (itemId: string) => void;
  };
}
