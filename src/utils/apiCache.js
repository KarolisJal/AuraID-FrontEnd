class ApiCache {
  constructor() {
    this.cache = new Map();
    this.maxSize = 100; // Maximum number of cached items
    this.cleanupInterval = 300000; // 5 minutes
    this.version = 1; // Cache version for handling API changes
    this.subscribers = new Map(); // Event subscribers for cache invalidation
    this.setupCleanup();
  }

  setupCleanup() {
    setInterval(() => {
      this.cleanup();
    }, this.cleanupInterval);
  }

  cleanup() {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now >= value.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  makeKey(endpoint, params = {}) {
    return `v${this.version}:${endpoint}:${JSON.stringify(params)}`;
  }

  get(endpoint, params = {}) {
    const key = this.makeKey(endpoint, params);
    const cached = this.cache.get(key);
    
    if (!cached) return null;
    
    // Check if data is stale
    if (Date.now() >= cached.expiresAt) {
      this.cache.delete(key);
      // Notify subscribers of stale data
      this.notifySubscribers(endpoint, 'stale', params);
      return null;
    }
    
    return cached.data;
  }

  set(endpoint, data, params = {}, ttl = 60000) { // Default TTL: 1 minute
    const key = this.makeKey(endpoint, params);
    
    // If cache is full, remove oldest entry
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
    
    const cacheEntry = {
      data,
      expiresAt: Date.now() + ttl,
      lastModified: Date.now()
    };
    
    this.cache.set(key, cacheEntry);
    this.notifySubscribers(endpoint, 'set', params);
  }

  subscribe(endpoint, callback) {
    if (!this.subscribers.has(endpoint)) {
      this.subscribers.set(endpoint, new Set());
    }
    this.subscribers.get(endpoint).add(callback);
    
    // Return unsubscribe function
    return () => {
      const subs = this.subscribers.get(endpoint);
      if (subs) {
        subs.delete(callback);
        if (subs.size === 0) {
          this.subscribers.delete(endpoint);
        }
      }
    };
  }

  notifySubscribers(endpoint, event, params) {
    const subs = this.subscribers.get(endpoint);
    if (subs) {
      subs.forEach(callback => {
        try {
          callback(event, params);
        } catch (error) {
          console.error('Error in cache subscriber:', error);
        }
      });
    }
  }

  invalidate(endpoint, params = {}) {
    const key = this.makeKey(endpoint, params);
    this.cache.delete(key);
    this.notifySubscribers(endpoint, 'invalidate', params);
  }

  invalidateByPattern(pattern) {
    const regex = new RegExp(pattern);
    for (const [key] of this.cache.entries()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  clear() {
    this.cache.clear();
    this.subscribers.clear();
  }

  // Increment cache version to invalidate all existing cache entries
  bumpVersion() {
    this.version++;
    this.clear();
  }
}

export const apiCache = new ApiCache(); 