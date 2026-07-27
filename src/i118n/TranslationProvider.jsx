import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export const TranslationProvider = ({ children }) => {
  const { i18n } = useTranslation();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initTranslations = async () => {
      try {
        // Get preferred language from localStorage
        const savedLanguage = localStorage.getItem('preferredLanguage');
        if (savedLanguage && i18n.language !== savedLanguage) {
          await i18n.changeLanguage(savedLanguage);
        }
        setIsReady(true);
      } catch (error) {
        console.error('Translation initialization error:', error);
        i18n.changeLanguage('en');
        setIsReady(true);
      }
    };

    initTranslations();
  }, [i18n]);

  if (!isReady) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading translations...</p>
        </div>
      </div>
    );
  }

  return children;
};