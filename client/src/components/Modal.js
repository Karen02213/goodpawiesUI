import React from 'react';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  type = 'info', 
  confirmText = 'OK', 
  cancelText = 'Cancel', 
  onConfirm, 
  onCancel,
  showCancel = false,
  children 
}) => {
  if (!isOpen) return null;

  const getModalIcon = () => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      case 'question':
        return '❓';
      case 'delete':
        return '🗑️';
      case 'edit':
        return '✏️';
      default:
        return 'ℹ️';
    }
  };

  const getModalClass = () => {
    return `modal-content ${type}`;
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    // Always close the modal after confirm action
    onClose();
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      onClose();
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className={getModalClass()}>
        <div className="modal-header">
          <div className="modal-icon">
            {getModalIcon()}
          </div>
          <h3 className="modal-title">{title}</h3>
          <button 
            className="modal-close" 
            onClick={onClose}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>
        
        <div className="modal-body">
          {message && <p className="modal-message">{message}</p>}
          {children}
        </div>
        
        <div className="modal-footer">
          {showCancel && (
            <button 
              className="btn btn-secondary" 
              onClick={handleCancel}
            >
              {cancelText}
            </button>
          )}
          <button 
            className={`btn ${type === 'delete' ? 'btn-danger' : 'btn-primary'}`}
            onClick={handleConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
