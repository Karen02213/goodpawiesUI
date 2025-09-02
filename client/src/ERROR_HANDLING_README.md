# Error Handling System

This document describes the comprehensive error handling system implemented in the GoodPawies UI application.

## Overview

The error handling system provides:
- **404 Error Page**: Handles page not found and various HTTP error codes
- **Global Modal System**: Displays success, error, warning, info, and confirmation modals
- **Error Boundary**: Catches React component errors
- **API Error Handling**: Automatic processing of API errors with appropriate user feedback
- **Context-based Error Management**: Centralized error handling across the application

## Components

### 1. Error Page (`/src/pages/ErrorPage.js`)

Displays error pages for various HTTP status codes and application errors.

**Features:**
- Handles 400, 401, 403, 404, 500, and other error codes
- Provides contextual messages and actions for each error type
- Responsive design with user-friendly interface
- Automatic navigation suggestions based on error type

**Usage:**
```javascript
// Navigate to error page programmatically
navigate('/error', { 
  state: { 
    error: { 
      status: 404, 
      message: "Custom error message" 
    } 
  } 
});
```

### 2. Modal System

#### Modal Component (`/src/components/Modal.js`)
Reusable modal component with different types:
- `success` - Green checkmark for successful operations
- `error` - Red X for errors
- `warning` - Yellow warning triangle
- `info` - Blue information icon
- `question` - Purple question mark for confirmations
- `delete` - Red trash can for delete confirmations
- `edit` - Teal edit icon

#### Modal Hook (`/src/hooks/useModal.js`)
Provides modal management functionality:
```javascript
const {
  modals,
  showModal,
  hideModal,
  showSuccess,
  showError,
  showWarning,
  showInfo,
  showConfirm,
  showDeleteConfirm,
  showNotImplemented
} = useModal();
```

#### Modal Container (`/src/components/ModalContainer.js`)
Renders all active modals in the application.

### 3. Error Boundary (`/src/components/ErrorBoundary.js`)

Catches React component errors and displays a fallback UI.

**Features:**
- Prevents app crashes from component errors
- Shows detailed error information in development mode
- Provides recovery options (reload, go home)
- Logs errors for debugging

### 4. Error Context (`/src/contexts/ErrorContext.js`)

Provides centralized error handling across the application.

**Features:**
- Wraps API calls with automatic error handling
- Provides consistent error messaging
- Integrates with modal system
- Handles navigation for severe errors

### 5. Error Handler Utility (`/src/utils/errorHandler.js`)

Utility functions for processing and handling errors.

**Features:**
- Standardizes error format across the application
- Processes API errors into user-friendly messages
- Provides higher-order functions for wrapping API calls
- Creates different types of notification modals

## Usage Examples

### Basic Modal Usage

```javascript
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
  
  return <button onClick={handleSave}>Save</button>;
};
```

### API Error Handling

```javascript
import { useError } from '../contexts/ErrorContext';

const MyComponent = () => {
  const { wrapApiCall } = useError();
  
  useEffect(() => {
    const fetchData = wrapApiCall(async () => {
      const response = await api.getData();
      setData(response.data);
    });
    
    fetchData();
  }, [wrapApiCall]);
};
```

### Confirmation Dialogs

```javascript
const MyComponent = () => {
  const { showDeleteConfirm, showSuccess } = useError();
  
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
  
  return <button onClick={handleDelete}>Delete</button>;
};
```

### Not Implemented Features

```javascript
const MyComponent = () => {
  const { showNotImplemented } = useError();
  
  const handleEditPet = () => {
    showNotImplemented('Pet editing');
  };
  
  return <button onClick={handleEditPet}>Edit Pet</button>;
};
```

## Error Types

### HTTP Status Codes
- **400**: Bad Request - Invalid input data
- **401**: Unauthorized - Authentication required
- **403**: Forbidden - Access denied
- **404**: Not Found - Resource doesn't exist
- **422**: Validation Error - Invalid data format
- **429**: Rate Limited - Too many requests
- **500**: Server Error - Internal server error
- **502/503**: Service Unavailable - Temporary server issues

### Application Errors
- **Network Error**: Connection issues
- **Validation Error**: Form validation failures
- **Component Error**: React component crashes
- **Unknown Error**: Unexpected application errors

## Styling

All error handling components are styled using CSS modules located in:
- `/src/styles/components/_error-modal.css`

The styles include:
- Responsive design for all screen sizes
- Consistent color scheme with app branding
- Smooth animations and transitions
- Accessibility features (focus management, ARIA labels)

## Best Practices

1. **Always wrap API calls** with error handling
2. **Use appropriate modal types** for different scenarios
3. **Provide clear, actionable error messages**
4. **Allow users to retry failed operations** when possible
5. **Log errors appropriately** for debugging
6. **Test error scenarios** during development
7. **Consider user context** when displaying errors

## Integration

The error handling system is integrated at the application level in `App.js`:

```javascript
function App() {
  return (
    <ErrorBoundary>
      <ErrorProvider>
        <AppContent />
      </ErrorProvider>
    </ErrorBoundary>
  );
}
```

This ensures that all components have access to error handling functionality and that any uncaught errors are properly handled.

## Future Enhancements

- Error reporting to external services
- User feedback collection on errors
- Retry mechanisms for network errors
- Offline error handling
- Error analytics and monitoring
