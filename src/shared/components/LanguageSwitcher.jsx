import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supportedLanguages } from '../../i118n/i18n';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isChanging, setIsChanging] = useState(false);
  const dropdownRef = useRef(null);

  const currentLanguage = supportedLanguages.find(
    (lang) => lang.code === i18n.language
  ) || supportedLanguages[0];

  const handleLanguageChange = async (languageCode) => {
    if (languageCode === i18n.language) {
      setIsOpen(false);
      return;
    }

    setIsChanging(true);
    try {
      await i18n.changeLanguage(languageCode);
      localStorage.setItem('preferredLanguage', languageCode);
      // Force re-render of components with translations
      window.dispatchEvent(new Event('languagechange'));
      
      // Show success message
      const lang = supportedLanguages.find(l => l.code === languageCode);
      showToast(`Language changed to ${lang?.name || languageCode}`, 'success');
    } catch (error) {
      console.error('Language change error:', error);
      showToast('Failed to change language', 'error');
    } finally {
      setIsChanging(false);
      setIsOpen(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Toast notification helper
  const showToast = (message, type = 'info') => {
    // You can integrate your existing Toast component here
    console.log(`${type}: ${message}`);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isChanging}
        className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm text-gray-700 dark:text-gray-300 disabled:opacity-50"
        title="Change Language"
      >
        {isChanging ? (
          <i className="fas fa-spinner fa-spin"></i>
        ) : (
          <>
            <span className="text-lg">{currentLanguage.flag}</span>
            <span className="hidden md:inline">{currentLanguage.name}</span>
            <i className={`fas fa-chevron-${isOpen ? 'up' : 'down'} text-xs transition-transform`}></i>
          </>
        )}
      </button>

      {isOpen && !isChanging && (
        <div className="absolute top-12 right-0 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-[9999]">
          <div className="p-2 max-h-96 overflow-y-auto">
            {/* Search bar */}
            <div className="mb-2 px-2">
              <input
                type="text"
                placeholder="Search languages..."
                className="w-full px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-green-500"
                onChange={(e) => {
                  const searchTerm = e.target.value.toLowerCase();
                  const items = dropdownRef.current?.querySelectorAll('.lang-item');
                  items?.forEach((item) => {
                    const text = item.textContent?.toLowerCase() || '';
                    item.style.display = text.includes(searchTerm) ? 'flex' : 'none';
                  });
                }}
              />
            </div>

            {supportedLanguages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`lang-item w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  i18n.language === lang.code
                    ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <span className="text-lg">{lang.flag}</span>
                <span className="flex-1 text-left">{lang.name}</span>
                {i18n.language === lang.code && (
                  <i className="fas fa-check text-green-500 text-xs"></i>
                )}
                <span className="text-xs text-gray-400 uppercase">{lang.code}</span>
              </button>
            ))}
          </div>

          <div className="p-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
            <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
              🌐 AI-Powered Translation
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;