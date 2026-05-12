import { useSelector } from 'react-redux';
import { showToast } from '@admin/components/common/Toast';

export const useNotification = () => {
  const { notifications, unreadCount } = useSelector((state) => state.notifications);

  const notifySuccess = (message) => {
    showToast(message, 'success');
  };

  const notifyError = (message) => {
    showToast(message, 'error');
  };

  const notifyInfo = (message) => {
    showToast(message, 'info');
  };

  return {
    notifications,
    unreadCount,
    notifySuccess,
    notifyError,
    notifyInfo,
  };
};
