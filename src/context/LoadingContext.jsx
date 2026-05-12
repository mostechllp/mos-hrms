import { createContext, useContext, useState, useCallback } from 'react';
import NavigationLoader from '../components/common/NavigationLoader';

const LoadingContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within LoadingProvider');
  }
  return context;
};

export const LoadingProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  const showLoader = useCallback((message = 'Loading...') => {
    setLoadingMessage(message);
    setIsLoading(true);
  }, []);

  const hideLoader = useCallback(() => {
    setIsLoading(false);
    setLoadingMessage('');
  }, []);

  return (
    <LoadingContext.Provider value={{ isLoading, loadingMessage, showLoader, hideLoader }}>
      {isLoading && <NavigationLoader message={loadingMessage} />}
      {children}
    </LoadingContext.Provider>
  );
};
