
// Configuration object for API data sources
export const DataSourceConfig = {
  useLocalData: false,
  customJsonPaths: {
    weapons: "data/weapons.json",
    collections: "data/collections.json",
    skins: "data/skins.json"
  }
};

// Add performance optimization settings
export const PerformanceConfig = {
  cacheResults: true,
  cacheDuration: 1000 * 60 * 5, // 5 minutes
  pageSize: 20, // Limit results per page for faster rendering
  prefetchEnabled: false // Disable prefetching for slower connections
};
