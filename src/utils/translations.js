// Import translation files
import enTranslations from '../translations/en.js';
import zhTranslations from '../translations/zh.js';

// Combine all translations
const translations = {
  en: enTranslations,
  zh: zhTranslations
};

// Interpolation function to replace placeholders like {username} with actual values
const interpolate = (text, params = {}) => {
  return text.replace(/\{(\w+)\}/g, (match, key) => {
    return params[key] !== undefined ? params[key] : match;
  });
};

// Get translation for a key with optional interpolation
export const t = (key, language = 'en', params = {}) => {
  const translation = translations[language]?.[key];
  if (!translation) {
    console.warn(`Translation key "${key}" not found for language "${language}"`);
    return key;
  }
  
  return interpolate(translation, params);
};

// Get all translations for a language
export const getTranslations = (language = 'en') => {
  return translations[language] || translations.en;
};

// Check if a translation exists
export const hasTranslation = (key, language = 'en') => {
  return !!translations[language]?.[key];
};

// Get available languages
export const getAvailableLanguages = () => {
  return Object.keys(translations);
};

// Get language display name
export const getLanguageDisplayName = (languageCode) => {
  const displayNames = {
    en: 'English',
    zh: '中文',
  };
  return displayNames[languageCode] || languageCode;
}; 