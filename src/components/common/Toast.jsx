// src/components/common/Toast.js
import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';

let toastContainer = null;
let toastRoot = null;

const ToastComponent = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  // Define colors and icons based on type
  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return {
          border: 'border-green-500',
          icon: 'fa-check-circle text-green-500',
        };
      case 'error':
        return {
          border: 'border-red-500',
          icon: 'fa-exclamation-triangle text-red-500',
        };
      case 'info':
      default:
        return {
          border: 'border-blue-500',
          icon: 'fa-info-circle text-blue-500',
        };
    }
  };

  const styles = getToastStyles();

  return (
    <div className="fixed bottom-6 right-6 z-[1300] animate-slideUp">
      <div className={`bg-white dark:bg-gray-800 rounded-full shadow-soft-lg border-l-4 ${styles.border} px-5 py-3 flex items-center gap-2`}>
        <i className={`fas ${styles.icon}`}></i>
        <span className="text-gray-800 dark:text-gray-200 text-sm">{message}</span>
      </div>
    </div>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const showToast = (message, type = 'success') => {
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    document.body.appendChild(toastContainer);
    toastRoot = createRoot(toastContainer);
  }

  const handleClose = () => {
    toastRoot.render(null);
  };

  toastRoot.render(<ToastComponent message={message} type={type} onClose={handleClose} />);
};

export const Toast = () => null;