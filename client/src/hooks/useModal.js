import { useState, useCallback } from 'react';

export const useModal = () => {
  const [modals, setModals] = useState([]);

  const showModal = useCallback((modalConfig) => {
    const id = Date.now() + Math.random();
    const modal = { id, ...modalConfig };
    setModals(prev => [...prev, modal]);
    return id;
  }, []);

  const hideModal = useCallback((id) => {
    setModals(prev => prev.filter(modal => modal.id !== id));
  }, []);

  const hideAllModals = useCallback(() => {
    setModals([]);
  }, []);

  // Predefined modal types
  const showSuccess = useCallback((title, message, options = {}) => {
    return showModal({
      type: 'success',
      title,
      message,
      confirmText: 'Great!',
      ...options
    });
  }, [showModal]);

  const showError = useCallback((title, message, options = {}) => {
    return showModal({
      type: 'error',
      title,
      message,
      confirmText: 'OK',
      ...options
    });
  }, [showModal]);

  const showWarning = useCallback((title, message, options = {}) => {
    return showModal({
      type: 'warning',
      title,
      message,
      confirmText: 'OK',
      ...options
    });
  }, [showModal]);

  const showInfo = useCallback((title, message, options = {}) => {
    return showModal({
      type: 'info',
      title,
      message,
      confirmText: 'OK',
      ...options
    });
  }, [showModal]);

  const showConfirm = useCallback((title, message, onConfirm, options = {}) => {
    return showModal({
      type: 'question',
      title,
      message,
      showCancel: true,
      confirmText: 'Yes',
      cancelText: 'No',
      onConfirm,
      ...options
    });
  }, [showModal]);

  const showDeleteConfirm = useCallback((title, message, onConfirm, options = {}) => {
    return showModal({
      type: 'delete',
      title,
      message,
      showCancel: true,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      onConfirm,
      ...options
    });
  }, [showModal]);

  const showNotImplemented = useCallback((feature = 'This feature') => {
    return showModal({
      type: 'info',
      title: 'Feature Not Available',
      message: `${feature} is not implemented yet. We're working on it!`,
      confirmText: 'Got it'
    });
  }, [showModal]);

  return {
    modals,
    showModal,
    hideModal,
    hideAllModals,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showConfirm,
    showDeleteConfirm,
    showNotImplemented
  };
};
