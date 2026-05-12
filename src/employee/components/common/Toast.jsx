import { useEffect } from 'react';
import { FiCheckCircle, FiInfo } from 'react-icons/fi';

let toastContainer = null;
let currentTimeout = null;

// Create a container for toasts if it doesn't exist
const getToastContainer = () => {
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }
  return toastContainer;
};

// Show toast function
// eslint-disable-next-line react-refresh/only-export-components
export const showToast = (message, isSuccess = true) => {
  const container = getToastContainer();
  
  // Clear previous timeout
  if (currentTimeout) {
    clearTimeout(currentTimeout);
  }
  
  // Remove existing toast
  const existingToast = container.querySelector('.toast-notification');
  if (existingToast) {
    existingToast.remove();
  }
  
  // Create new toast element
  const toastElement = document.createElement('div');
  toastElement.className = 'toast-notification fixed bottom-6 right-6 bg-[var(--surface)] text-[var(--text)] py-3 px-5 rounded-full text-sm font-medium shadow-lg border-l-4 border-green-500 z-1300 flex items-center gap-2 animate-slide-up';
  
  const icon = isSuccess ? 
    '<svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" class="text-green-500" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"></path></svg>' :
    '<svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" class="text-green-500" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"></path></svg>';
  
  toastElement.innerHTML = `${icon}<span>${message}</span>`;
  
  container.appendChild(toastElement);
  
  // Auto remove after 2.5 seconds
  currentTimeout = setTimeout(() => {
    if (toastElement && toastElement.remove) {
      toastElement.remove();
    }
  }, 2500);
};

const Toast = ({ message, isSuccess = true, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 2500);
    
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="toast-notification fixed bottom-6 right-6 bg-[var(--surface)] text-[var(--text)] py-3 px-5 rounded-full text-sm font-medium shadow-lg border-l-4 border-green-500 z-1300 flex items-center gap-2 animate-slide-up">
      {isSuccess ? (
        <FiCheckCircle className="text-green-500" />
      ) : (
        <FiInfo className="text-green-500" />
      )}
      {message}
    </div>
  );
};

export default Toast;