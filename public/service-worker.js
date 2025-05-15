
// Service Worker for CS Skin Vault - PWA Functionality

const CACHE_NAME = 'cs-skin-vault-v1';
const OFFLINE_PAGE = '/';

// Files to cache for offline access - only cache assets, not source files
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/lovable-uploads/bf94853c-aef8-4bc7-8ca6-60524a082ca0.png',
  '/favicon.ico',
  // Don't cache source files that get bundled
];

// Install event - cache critical assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
          return null;
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Don't cache API requests or source files
  if (event.request.url.includes('/api/') || 
      event.request.url.includes('/src/') || 
      event.request.url.includes('localhost')) {
    return fetch(event.request);
  }
  
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        
        // Clone the request
        const fetchRequest = event.request.clone();
        
        return fetch(fetchRequest).then(
          (response) => {
            // Check if valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clone the response
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
              
            return response;
          }
        );
      })
      .catch(() => {
        // If both cache and network fail, serve the offline page
        if (event.request.mode === 'navigate') {
          return caches.match(OFFLINE_PAGE);
        }
        return new Response('Network error occurred', {
          status: 503,
          statusText: 'Service Unavailable'
        });
      })
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-inventory') {
    event.waitUntil(syncInventoryData());
  }
});

// Function to sync inventory data when back online
async function syncInventoryData() {
  console.log('Background sync: inventory data');
}
