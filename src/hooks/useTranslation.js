import { useLanguage } from '../contexts/LanguageContext';
import { t } from '../utils/translations';

export const useTranslation = () => {
  const { currentLanguage, changeLanguage } = useLanguage();
  
  const translate = (key, params = {}) => {
    return t(key, currentLanguage, params);
  };
  
  return {
    t: translate,
    currentLanguage,
    changeLanguage,
  };
}; 