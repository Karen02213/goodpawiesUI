import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const ErrorPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const error = location.state?.error || {};

  const getErrorInfo = () => {
    const status = error.status || 404;
    
    switch (status) {
      case 400:
        return {
          title: 'Bad Request',
          message: 'The request could not be understood by the server.',
          emoji: '🚫'
        };
      case 401:
        return {
          title: 'Unauthorized',
          message: 'You need to log in to access this page.',
          emoji: '🔐'
        };
      case 403:
        return {
          title: 'Forbidden',
          message: 'You don\'t have permission to access this resource.',
          emoji: '⛔'
        };
      case 404:
        return {
          title: 'Page Not Found',
          message: 'The page you\'re looking for doesn\'t exist.',
          emoji: '🐕‍🦺'
        };
      case 500:
        return {
          title: 'Server Error',
          message: 'Something went wrong on our end. We\'re working to fix it.',
          emoji: '🛠️'
        };
      default:
        return {
          title: 'Something Went Wrong',
          message: 'An unexpected error occurred.',
          emoji: '😿'
        };
    }
  };

  const errorInfo = getErrorInfo();

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="error-page">
      <div className="error-container">
        <div className="error-content">
          <div className="error-icon">
            {errorInfo.emoji}
          </div>
          
          <h1 className="error-title">
            {errorInfo.title}
          </h1>
          
          <p className="error-message">
            {error.message || errorInfo.message}
          </p>
          
          {error.status && (
            <div className="error-code">
              Error Code: {error.status}
            </div>
          )}
          
          <div className="error-actions">
            <button 
              className="btn btn-primary"
              onClick={handleGoHome}
            >
              🏠 Go Home
            </button>
            
            <button 
              className="btn btn-secondary"
              onClick={handleGoBack}
            >
              ← Go Back
            </button>
            
            {(error.status >= 500 || !error.status) && (
              <button 
                className="btn btn-outline"
                onClick={handleRetry}
              >
                🔄 Try Again
              </button>
            )}
          </div>
          
          {error.status === 404 && (
            <div className="error-suggestions">
              <h3>What can you do?</h3>
              <ul>
                <li>Check the URL for typos</li>
                <li>Go back to the previous page</li>
                <li>Visit our <button className="link-button" onClick={handleGoHome}>homepage</button></li>
                <li>Search for what you're looking for</li>
              </ul>
            </div>
          )}
          
          {error.status === 401 && (
            <div className="error-suggestions">
              <p>
                <button 
                  className="link-button" 
                  onClick={() => navigate('/login')}
                >
                  Click here to log in
                </button>
              </p>
            </div>
          )}
        </div>
        
        <div className="error-footer">
          <p>
            Need help? Contact our support team or check our FAQ section.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
