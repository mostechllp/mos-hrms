import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useLoading } from '../../context/LoadingContext';

const RouteChangeLoader = ({ children }) => {
  const location = useLocation();
  const { showLoader, hideLoader } = useLoading();
  const isInitialMount = useRef(true);

  useEffect(() => {
    // Skip loader on initial mount (Suspense handles it)
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    
    showLoader('Loading...');
    const timer = setTimeout(() => {
      hideLoader();
    }, 300);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  return <>{children}</>;
};

export default RouteChangeLoader;
