/**
 * Error handling utilities for the GoodPawies application
 */

export const ERROR_TYPES = {
  NETWORK: 'NETWORK_ERROR',
  VALIDATION: 'VALIDATION_ERROR', 
  AUTHENTICATION: 'AUTHENTICATION_ERROR',
  AUTHORIZATION: 'AUTHORIZATION_ERROR',
  NOT_FOUND: 'NOT_FOUND_ERROR',
  SERVER: 'SERVER_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR'
};

export const ERROR_MESSAGES = {
  400: 'Bad request. Please check your input and try again.',
  401: 'You need to log in to access this resource.',
  403: 'You don\'t have permission to access this resource.',
  404: 'The requested resource was not found.',
  422: 'The data provided is invalid. Please check and try again.',
  429: 'Too many requests. Please wait a moment and try again.',
  500: 'Something went wrong on our end. Please try again later.',
  502: 'Service temporarily unavailable. Please try again later.',
  503: 'Service temporarily unavailable. Please try again later.',
  default: 'An unexpected error occurred. Please try again.'
};

/**
 * Processes API errors and returns standardized error information
 * @param {Error} error - The error object from the API call
 * @returns {Object} Standardized error object
 */
export const processApiError = (error) => {
  if (!error.response) {
    // Network error or no response
    return {
      type: ERROR_TYPES.NETWORK,
      status: null,
      message: 'Network error. Please check your internet connection and try again.',
      title: 'Connection Error',
      canRetry: true
    };
  }

  const status = error.response.status;
  const serverMessage = error.response.data?.message || error.response.data?.error;
  
  let errorType = ERROR_TYPES.UNKNOWN;
  let title = 'Error';
  let canRetry = false;

  switch (status) {
    case 400:
      errorType = ERROR_TYPES.VALIDATION;
      title = 'Invalid Request';
      break;
    case 401:
      errorType = ERROR_TYPES.AUTHENTICATION;
      title = 'Authentication Required';
      break;
    case 403:
      errorType = ERROR_TYPES.AUTHORIZATION;
      title = 'Access Denied';
      break;
    case 404:
      errorType = ERROR_TYPES.NOT_FOUND;
      title = 'Not Found';
      break;
    case 422:
      errorType = ERROR_TYPES.VALIDATION;
      title = 'Validation Error';
      break;
    case 429:
      errorType = ERROR_TYPES.SERVER;
      title = 'Rate Limited';
      canRetry = true;
      break;
    case 500:
    case 502:
    case 503:
      errorType = ERROR_TYPES.SERVER;
      title = 'Server Error';
      canRetry = true;
      break;
    default:
      errorType = ERROR_TYPES.UNKNOWN;
      title = 'Unexpected Error';
      canRetry = true;
  }

  return {
    type: errorType,
    status,
    message: serverMessage || ERROR_MESSAGES[status] || ERROR_MESSAGES.default,
    title,
    canRetry,
    originalError: error
  };
};

/**
 * Higher-order function to wrap API calls with error handling
 * @param {Function} apiCall - The API function to wrap
 * @param {Object} options - Options for error handling
 * @returns {Function} Wrapped API function
 */
export const withErrorHandling = (apiCall, options = {}) => {
  const { 
    showModal = null, 
    navigate = null, 
    onError = null,
    silent = false 
  } = options;

  return async (...args) => {
    try {
      return await apiCall(...args);
    } catch (error) {
      const processedError = processApiError(error);
      
      // Call custom error handler if provided
      if (onError) {
        onError(processedError);
      }

      // Navigate to error page for specific errors
      if (navigate && (processedError.status === 404 || processedError.status >= 500)) {
        navigate('/error', { 
          state: { 
            error: {
              status: processedError.status,
              message: processedError.message
            }
          }
        });
        return null;
      }

      // Show modal for other errors (if not silent)
      if (!silent && showModal) {
        showModal({
          type: 'error',
          title: processedError.title,
          message: processedError.message
        });
      }

      // Re-throw for component-level handling if needed
      throw processedError;
    }
  };
};

/**
 * Utility to create different types of notification modals
 */
export const createNotificationModal = (type, title, message, options = {}) => {
  const baseConfig = {
    type,
    title,
    message,
    ...options
  };

  switch (type) {
    case 'success':
      return {
        ...baseConfig,
        confirmText: 'Great!'
      };
    case 'error':
      return {
        ...baseConfig,
        confirmText: 'OK'
      };
    case 'warning':
      return {
        ...baseConfig,
        confirmText: 'Understood'
      };
    case 'info':
      return {
        ...baseConfig,
        confirmText: 'Got it'
      };
    case 'not-implemented':
      return {
        type: 'info',
        title: 'Feature Not Available',
        message: `${title} is not implemented yet. We're working on it!`,
        confirmText: 'Got it'
      };
    default:
      return baseConfig;
  }
};
