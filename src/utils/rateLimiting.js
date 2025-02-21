import { toast } from 'react-toastify';

const DEFAULT_COOLDOWN = 5000; // 5 seconds default cooldown
const DEFAULT_MAX_RETRIES = 3;

class RateLimitManager {
  constructor() {
    this.lastCallTimes = new Map();
    this.retryTimeouts = new Map();
    this.retryAttempts = new Map();
  }

  async executeWithRateLimit(
    key,
    operation,
    {
      cooldown = DEFAULT_COOLDOWN,
      maxRetries = DEFAULT_MAX_RETRIES,
      onRateLimit,
      onError,
    } = {}
  ) {
    const now = Date.now();
    const lastCallTime = this.lastCallTimes.get(key) || 0;

    // Check if we're still in cooldown period
    if (now - lastCallTime < cooldown) {
      console.log(`Rate limiting in effect for ${key}. Skipping operation.`);
      return null;
    }

    try {
      // Clear any existing retry timeout
      if (this.retryTimeouts.get(key)) {
        clearTimeout(this.retryTimeouts.get(key));
      }

      const result = await operation();
      
      // Reset retry attempts on success
      this.retryAttempts.set(key, 0);
      this.lastCallTimes.set(key, now);
      
      return result;
    } catch (error) {
      const currentRetries = this.retryAttempts.get(key) || 0;

      if (error.response?.status === 429) {
        // Handle rate limit response
        const retryAfter = parseInt(error.response.headers['retry-after']) * 1000 || cooldown;
        console.log(`Rate limited for ${key}. Retrying after ${retryAfter}ms`);

        if (currentRetries < maxRetries) {
          this.retryAttempts.set(key, currentRetries + 1);
          
          // Setup retry
          const retryTimeout = setTimeout(async () => {
            try {
              const result = await this.executeWithRateLimit(key, operation, {
                cooldown,
                maxRetries,
                onRateLimit,
                onError,
              });
              
              if (onRateLimit) {
                onRateLimit(result);
              }
            } catch (retryError) {
              if (onError) {
                onError(retryError);
              }
            }
          }, retryAfter);

          this.retryTimeouts.set(key, retryTimeout);
          
          // Show toast notification
          toast.warning(`Rate limit reached. Retrying in ${Math.ceil(retryAfter / 1000)} seconds.`);
        } else {
          toast.error('Maximum retry attempts reached. Please try again later.');
          throw error;
        }
      } else {
        // Handle other errors
        if (onError) {
          onError(error);
        }
        throw error;
      }
    }
  }

  clearRateLimit(key) {
    this.lastCallTimes.delete(key);
    if (this.retryTimeouts.get(key)) {
      clearTimeout(this.retryTimeouts.get(key));
    }
    this.retryTimeouts.delete(key);
    this.retryAttempts.delete(key);
  }
}

export const rateLimitManager = new RateLimitManager(); 