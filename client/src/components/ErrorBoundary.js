import React from 'react';
import { useNavigate } from 'react-router-dom';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error Boundary caught an error:', error, errorInfo);
    }
    
    // Here you could also log the error to an error reporting service
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback 
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          resetError={() => this.setState({ hasError: false, error: null, errorInfo: null })}
        />
      );
    }

    return this.props.children;
  }
}

const ErrorFallback = ({ error, errorInfo, resetError }) => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    resetError();
    navigate('/');
  };

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="error-page">
      <div className="error-container">
        <div className="error-content">
          <div className="error-icon">🚨</div>
          
          <h1 className="error-title">Oops! Something went wrong</h1>
          
          <p className="error-message">
            We're sorry, but something unexpected happened. This error has been logged 
            and we're working to fix it.
          </p>
          
          <div className="error-code">
            {error?.message || 'Unknown error occurred'}
          </div>
          
          <div className="error-actions">
            <button className="btn btn-primary" onClick={handleReload}>
              🔄 Reload Page
            </button>
            <button className="btn btn-secondary" onClick={handleGoHome}>
              🏠 Go Home
            </button>
          </div>
          
          {process.env.NODE_ENV === 'development' && (
            <details className="error-details">
              <summary>Error Details (Development Mode)</summary>
              <pre className="error-stack">
                {error && error.stack}
                {errorInfo.componentStack}
              </pre>
            </details>
          )}
        </div>
        
        <div className="error-footer">
          <p>If this problem persists, please contact our support team.</p>
        </div>
      </div>
    </div>
  );
};

export default ErrorBoundary;
