import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1';

let cache = {};
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// Helper to generate a cache key from config
const getCacheKey = (config) => {
  const url = config.url || '';
  const params = config.params ? JSON.stringify(config.params) : '';
  return `${url}?${params}`;
};

const clearCache = () => {
  cache = {};
};

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to serve from cache
apiClient.interceptors.request.use((config) => {
  if (config.method?.toLowerCase() === 'get') {
    const cacheKey = getCacheKey(config);
    const cachedEntry = cache[cacheKey];

    if (cachedEntry && (Date.now() - cachedEntry.timestamp < CACHE_TTL_MS)) {
      // Serve from cache by overriding the adapter
      config.adapter = () => {
        return Promise.resolve({
          data: cachedEntry.data,
          status: 200,
          statusText: 'OK',
          headers: {},
          config: config,
        });
      };
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor to populate cache or clear on mutation
apiClient.interceptors.response.use((response) => {
  const { config } = response;
  const method = config.method?.toLowerCase();

  if (method === 'get') {
    const cacheKey = getCacheKey(config);
    cache[cacheKey] = {
      data: response.data,
      timestamp: Date.now(),
    };
  } else if (['post', 'put', 'delete'].includes(method)) {
    // Clear cache on any write mutation
    clearCache();
  }
  return response;
}, (error) => {
  // If a mutation failed, we might still want to invalidate the cache just in case partial state was written
  const method = error.config?.method?.toLowerCase();
  if (method && ['post', 'put', 'delete'].includes(method)) {
    clearCache();
  }
  return Promise.reject(error);
});

export { apiClient, clearCache };
export default apiClient;
