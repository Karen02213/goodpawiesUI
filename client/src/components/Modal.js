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
    <>

      <div className="modal-backdrop show"></div>
      <div className="modal show" tabIndex="-1" role="dialog" onClick={handleOverlayClick}>
        <div className={`modal-dialog modal-dialog-centered ${type ? `modal-${type}` : ''}`} onClick={(e) => e.stopPropagation()}>
          <div className="modal-content">
            <div className={`modal-header ${type ? `modal-header-${type}` : ''}`}>
              <div className="flex align-items-center gap-2">
                <span className="modal-icon-lg">{getModalIcon()}</span>
                <h5 className="modal-title">{title}</h5>
              </div>
              <button
                type="button"
                className="modal-close"
                onClick={onClose}
                aria-label="Close"
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>

            <div className="modal-body">
              {message && <p>{message}</p>}
              {children}
            </div>

            <div className="modal-footer">
              {showCancel && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCancel}
                >
                  {cancelText}
                </button>
              )}
              <button
                type="button"
                className={`btn ${type === 'delete' ? 'btn-danger' : 'btn-primary'}`}
                onClick={handleConfirm}
              >
                {confirmText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Modal;
