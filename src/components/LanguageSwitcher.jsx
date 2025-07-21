import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { getLanguageDisplayName, getAvailableLanguages } from '../utils/translations';
import { GlobeAltIcon } from '@heroicons/react/24/outline';

const LanguageSwitcher = () => {
  const { t, currentLanguage, changeLanguage } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLanguageChange = (language) => {
    changeLanguage(language);
    setIsOpen(false);
  };

  const availableLanguages = getAvailableLanguages();

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1 text-gray-700 hover:bg-indigo-100 hover:text-indigo-600 px-3 py-2 rounded-md transition-all duration-200 transform hover:scale-105"
        title={t('language')}
      >
        <GlobeAltIcon className="w-5 h-5" />
        <span className="hidden sm:inline">{getLanguageDisplayName(currentLanguage)}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
          {availableLanguages.map((language) => (
            <button
              key={language}
              onClick={() => handleLanguageChange(language)}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors duration-200 ${
                currentLanguage === language ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-gray-700'
              }`}
            >
              {getLanguageDisplayName(language)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher; 