import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('en');

  // Detect user's preferred language on component mount
  useEffect(() => {
    // Check localStorage first
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage) {
      setCurrentLanguage(savedLanguage);
      return;
    }

    // Detect browser language
    const browserLanguage = navigator.language || navigator.userLanguage;
    if (browserLanguage) {
      const languageCode = browserLanguage.split('-')[0];
      if (languageCode === 'zh' || languageCode === 'zh-CN' || languageCode === 'zh-TW') {
        setCurrentLanguage('zh');
        localStorage.setItem('language', 'zh');
      } else {
        setCurrentLanguage('en');
        localStorage.setItem('language', 'en');
      }
    }
  }, []);

  const changeLanguage = (language) => {
    setCurrentLanguage(language);
    localStorage.setItem('language', language);
  };

  const value = {
    currentLanguage,
    changeLanguage,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}; 

// Export the hook separately to follow React Fast Refresh guidelines
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}; 