import { toast } from 'react-toastify';

export const ErrorTypes = {
  RATE_LIMIT: 'RATE_LIMIT',
  NETWORK: 'NETWORK',
  AUTH: 'AUTH',
  VALIDATION: 'VALIDATION',
  SERVER: 'SERVER',
  UNKNOWN: 'UNKNOWN'
};

export const ErrorMessages = {
  [ErrorTypes.RATE_LIMIT]: 'Too many requests. Please wait before trying again.',
  [ErrorTypes.NETWORK]: 'Network error. Please check your connection.',
  [ErrorTypes.AUTH]: 'Authentication error. Please log in again.',
  [ErrorTypes.VALIDATION]: 'Invalid input. Please check your data.',
  [ErrorTypes.SERVER]: 'Server error. Please try again later.',
  [ErrorTypes.UNKNOWN]: 'An unexpected error occurred.'
};

export class AppError extends Error {
  constructor(type, message, originalError = null) {
    super(message || ErrorMessages[type]);
    this.type = type;
    this.originalError = originalError;
  }
}

export const handleError = (error, defaultType = ErrorTypes.UNKNOWN) => {
  console.error('Error details:', error);

  // Determine error type
  let errorType = defaultType;
  let errorMessage = '';

  if (error.response) {
    switch (error.response.status) {
      case 429:
        errorType = ErrorTypes.RATE_LIMIT;
        const retryAfter = error.response.headers['retry-after'];
        errorMessage = retryAfter 
          ? `Rate limit exceeded. Please try again in ${retryAfter} seconds.`
          : ErrorMessages[ErrorTypes.RATE_LIMIT];
        break;
      case 401:
        errorType = ErrorTypes.AUTH;
        break;
      case 400:
        errorType = ErrorTypes.VALIDATION;
        errorMessage = error.response.data?.message || ErrorMessages[ErrorTypes.VALIDATION];
        break;
      case 500:
        errorType = ErrorTypes.SERVER;
        break;
      default:
        errorType = ErrorTypes.UNKNOWN;
    }
  } else if (error.request) {
    errorType = ErrorTypes.NETWORK;
  }

  // Use custom message if provided, otherwise use default for type
  const finalMessage = errorMessage || ErrorMessages[errorType];

  // Show toast notification based on error type
  switch (errorType) {
    case ErrorTypes.RATE_LIMIT:
      toast.warning(finalMessage);
      break;
    case ErrorTypes.AUTH:
      toast.error(finalMessage);
      // Optionally redirect to login
      if (window.location.pathname !== '/login') {
        setTimeout(() => window.location.href = '/login', 1500);
      }
      break;
    default:
      toast.error(finalMessage);
  }

  return new AppError(errorType, finalMessage, error);
};

// Legacy support for existing code
export const handleApiError = (error) => {
  const appError = handleError(error);
  return Promise.reject(appError);
}; 