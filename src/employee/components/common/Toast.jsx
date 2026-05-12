import { useEffect } from 'react';
import { FiCheckCircle, FiInfo } from 'react-icons/fi';

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