import { toast } from 'react-toastify';

export const handleApiError = (error) => {
  console.error('API Error:', error);

  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    const status = error.response.status;
    const message = error.response.data?.message || 'An error occurred';

    switch (status) {
      case 400:
        toast.error(`Bad Request: ${message}`);
        break;
      case 401:
        toast.error('Session expired. Please login again.');
        // Handle unauthorized access
        break;
      case 403:
        toast.error('You do not have permission to perform this action');
        break;
      case 404:
        toast.error('Resource not found');
        break;
      case 422:
        toast.error('Validation error. Please check your input.');
        break;
      case 500:
        toast.error('Internal server error. Please try again later.');
        break;
      default:
        toast.error(message);
    }
  } else if (error.request) {
    // The request was made but no response was received
    toast.error('No response from server. Please check your internet connection.');
  } else {
    // Something happened in setting up the request that triggered an Error
    toast.error('An unexpected error occurred');
  }

  return Promise.reject(error);
}; 