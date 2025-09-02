import React, { createContext, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useModal } from '../hooks/useModal';
import { processApiError, withErrorHandling } from '../utils/errorHandler';

const ErrorContext = createContext();

export const useError = () => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
};

export const ErrorProvider = ({ children }) => {
  const navigate = useNavigate();
  const modal = useModal();

  const handleError = (error, options = {}) => {
    const { 
      showModal: shouldShowModal = true, 
      navigateOnError = true,
      silent = false 
    } = options;
    
    const processedError = processApiError(error);
    
    // Navigate to error page for 404 and 500+ errors
    if (navigateOnError && (processedError.status === 404 || processedError.status >= 500)) {
      navigate('/error', { 
        state: { 
          error: {
            status: processedError.status,
            message: processedError.message
          }
        }
      });
      return;
    }

    // Show modal for other errors
    if (!silent && shouldShowModal) {
      modal.showError(processedError.title, processedError.message);
    }

    return processedError;
  };

  const wrapApiCall = (apiCall, options = {}) => {
    return withErrorHandling(apiCall, {
      showModal: modal.showModal,
      navigate,
      onError: (error) => handleError(error, { showModal: false, navigateOnError: false }),
      ...options
    });
  };

  const value = {
    handleError,
    wrapApiCall,
    showSuccess: modal.showSuccess,
    showError: modal.showError,
    showWarning: modal.showWarning,
    showInfo: modal.showInfo,
    showConfirm: modal.showConfirm,
    showDeleteConfirm: modal.showDeleteConfirm,
    showNotImplemented: modal.showNotImplemented,
    modals: modal.modals,
    hideModal: modal.hideModal,
    hideAllModals: modal.hideAllModals
  };

  return (
    <ErrorContext.Provider value={value}>
      {children}
    </ErrorContext.Provider>
  );
};
