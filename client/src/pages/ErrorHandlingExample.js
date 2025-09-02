import React from 'react';
import { useError } from '../contexts/ErrorContext';

/**
 * Example component demonstrating how to use the error handling system
 * This can be used as a reference for implementing error handling in other components
 */
const ErrorHandlingExample = () => {
  const { 
    showSuccess, 
    showError, 
    showWarning, 
    showInfo, 
    showConfirm, 
    showDeleteConfirm,
    showNotImplemented,
    wrapApiCall,
    handleError
  } = useError();

  // Example of showing different types of modals
  const handleShowSuccess = () => {
    showSuccess('Success!', 'Your operation completed successfully.');
  };

  const handleShowError = () => {
    showError('Error Occurred', 'Something went wrong. Please try again.');
  };

  const handleShowWarning = () => {
    showWarning('Warning', 'Please be careful with this action.');
  };

  const handleShowInfo = () => {
    showInfo('Information', 'This is some helpful information.');
  };

  const handleShowConfirm = () => {
    showConfirm(
      'Confirm Action',
      'Are you sure you want to proceed?',
      () => {
        console.log('User confirmed');
        showSuccess('Confirmed', 'Action completed successfully!');
      }
    );
  };

  const handleShowDeleteConfirm = () => {
    showDeleteConfirm(
      'Delete Item',
      'This action cannot be undone.',
      () => {
        console.log('User confirmed deletion');
        showSuccess('Deleted', 'Item deleted successfully!');
      }
    );
  };

  const handleShowNotImplemented = () => {
    showNotImplemented('This feature');
  };

  // Example of using wrapApiCall for automatic error handling
  const handleApiCall = () => {
    const wrappedApiCall = wrapApiCall(async () => {
      // Simulate API call that might fail
      throw new Error('Simulated API error');
    });
    
    wrappedApiCall();
  };

  // Example of manual error handling
  const handleManualError = () => {
    try {
      throw new Error('Manual error example');
    } catch (error) {
      handleError(error);
    }
  };

  return (
    <div className="error-example-page">
      <h1>Error Handling Examples</h1>
      <p>This page demonstrates various error handling and modal features.</p>
      
      <div className="button-grid">
        <button className="btn btn-primary" onClick={handleShowSuccess}>
          Show Success Modal
        </button>
        
        <button className="btn btn-danger" onClick={handleShowError}>
          Show Error Modal
        </button>
        
        <button className="btn btn-warning" onClick={handleShowWarning}>
          Show Warning Modal
        </button>
        
        <button className="btn btn-info" onClick={handleShowInfo}>
          Show Info Modal
        </button>
        
        <button className="btn btn-secondary" onClick={handleShowConfirm}>
          Show Confirm Modal
        </button>
        
        <button className="btn btn-danger" onClick={handleShowDeleteConfirm}>
          Show Delete Confirm
        </button>
        
        <button className="btn btn-outline" onClick={handleShowNotImplemented}>
          Show Not Implemented
        </button>
        
        <button className="btn btn-secondary" onClick={handleApiCall}>
          Test API Error
        </button>
        
        <button className="btn btn-secondary" onClick={handleManualError}>
          Test Manual Error
        </button>
      </div>
      
      <div className="usage-examples">
        <h2>Usage Examples</h2>
        
        <h3>1. Basic Modal Usage</h3>
        <pre>{`
import { useError } from '../contexts/ErrorContext';

const MyComponent = () => {
  const { showSuccess, showError } = useError();
  
  const handleSave = async () => {
    try {
      await saveData();
      showSuccess('Saved!', 'Your data has been saved successfully.');
    } catch (error) {
      showError('Save Failed', 'Unable to save data. Please try again.');
    }
  };
};
        `}</pre>
        
        <h3>2. API Error Handling</h3>
        <pre>{`
import { useError } from '../contexts/ErrorContext';

const MyComponent = () => {
  const { wrapApiCall } = useError();
  
  useEffect(() => {
    const fetchData = wrapApiCall(async () => {
      const response = await api.getData();
      setData(response.data);
    });
    
    fetchData();
  }, []);
};
        `}</pre>
        
        <h3>3. Confirmation Dialogs</h3>
        <pre>{`
const handleDelete = () => {
  showDeleteConfirm(
    'Delete Item',
    'This action cannot be undone.',
    async () => {
      await deleteItem();
      showSuccess('Deleted', 'Item deleted successfully!');
    }
  );
};
        `}</pre>
      </div>
    </div>
  );
};

export default ErrorHandlingExample;
