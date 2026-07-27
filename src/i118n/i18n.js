import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { I18nSolutions } from 'i18nsolutions';

// Supported languages
const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
];

// Initialize i18nsolutions with auto-translate
const i18nSolutions = new I18nSolutions({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  provider: import.meta.env.VITE_TRANSLATION_PROVIDER || 'openai',
  // Auto-translate all text - NO need for t() function in components
  autoTranslate: true,
  // Languages to support
  languages: languages.map(l => l.code),
  // Fallback language
  fallbackLng: 'en',
  // Enable caching to reduce API calls
  cache: true,
  // Cache duration in seconds (1 week)
  cacheDuration: 604800,
  // Exclude these attributes from translation
  autoTranslateExclude: [
    'data-testid',
    'class',
    'className',
    'id',
    'style',
    'href',
    'src',
    'alt',
    'title',
    'placeholder'
  ],
  // Exclude these elements from translation
  autoTranslateExcludeElements: [
    'script',
    'style',
    'code',
    'pre',
    'noscript'
  ],
});

// Initialize i18n
i18n
  .use(i18nSolutions)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    debug: import.meta.env.VITE_NODE_ENV === 'development',
    interpolation: {
      escapeValue: false,
    },
    // Auto-translate will handle everything
    resources: {},
    react: {
      useSuspense: false,
    },
  });

export const supportedLanguages = languages;

export default i18n;