# Bilingual Feature Implementation

This document explains how the bilingual (English/Chinese) feature is implemented in the BuildHub application.

## Overview

The bilingual feature allows users to switch between English and Chinese languages throughout the application. The system automatically detects the user's browser language and provides a language switcher in the navigation.

## Architecture

### 1. Language Context (`src/contexts/LanguageContext.jsx`)
- Manages the current language state
- Provides language switching functionality
- Automatically detects browser language on first visit
- Persists language preference in localStorage

### 2. Translation Files
- `src/translations/en.js` - English translations
- `src/translations/zh.js` - Chinese translations

### 3. Translation Utilities (`src/utils/translations.js`)
- Provides translation functions with interpolation support
- Handles missing translations gracefully
- Supports parameter substitution (e.g., `{username}`)

### 4. Language Switcher Component (`src/components/LanguageSwitcher.jsx`)
- Dropdown component for language selection
- Located in the navigation bar
- Shows current language with globe icon

### 5. Translation Hook (`src/hooks/useTranslation.js`)
- Custom hook for easy translation usage
- Provides `t()` function for components

## Usage

### Basic Translation
```jsx
import { useTranslation } from '../hooks/useTranslation';

const MyComponent = () => {
  const { t } = useTranslation();
  
  return <h1>{t('welcomeToBuildHub')}</h1>;
};
```

### Translation with Parameters
```jsx
const { t } = useTranslation();

// In translation file: "Hello, {username}"
return <p>{t('hello', { username: user.username })}</p>;
```

### Direct Translation Function
```jsx
import { t } from '../utils/translations';
import { useLanguage } from '../contexts/LanguageContext';

const MyComponent = () => {
  const { currentLanguage } = useLanguage();
  
  return <p>{t('someKey', currentLanguage, { param: 'value' })}</p>;
};
```

## Language Detection

The system automatically detects the user's preferred language:

1. **First Visit**: Checks browser language settings
   - Chinese browsers (zh, zh-CN, zh-TW) → Chinese
   - All others → English

2. **Returning Users**: Uses saved preference from localStorage

3. **Manual Switch**: Users can change language via the language switcher

## Adding New Translations

### 1. Add to English Translation File
```javascript
// src/translations/en.js
export default {
  // ... existing translations
  newKey: 'New English Text',
  welcomeMessage: 'Welcome, {name}!',
};
```

### 2. Add to Chinese Translation File
```javascript
// src/translations/zh.js
export default {
  // ... existing translations
  newKey: '新的中文文本',
  welcomeMessage: '欢迎，{name}！',
};
```

### 3. Use in Components
```jsx
const { t } = useTranslation();
return <p>{t('newKey')}</p>;
// or with parameters
return <p>{t('welcomeMessage', { name: 'John' })}</p>;
```

## Translation Keys Structure

The translation files are organized into logical sections:

- **Navigation**: Menu items, buttons
- **Common**: Reusable UI elements
- **Authentication**: Login/register forms
- **Project Related**: Project-specific terms
- **Comments**: Comment system
- **Search**: Search functionality
- **Profile**: User profile pages
- **Messages**: Messaging system
- **Admin**: Admin dashboard
- **Actions**: Common actions (save, delete, etc.)
- **Errors**: Error messages
- **Success**: Success messages
- **Footer**: Footer content
- **Placeholders**: Form placeholders
- **Time**: Time-related text
- **Validation**: Form validation messages

## Best Practices

1. **Use Descriptive Keys**: Choose clear, descriptive translation keys
2. **Group Related Keys**: Organize translations by feature/component
3. **Use Parameters**: For dynamic content, use parameter substitution
4. **Provide Fallbacks**: Always provide English fallbacks for missing translations
5. **Test Both Languages**: Ensure UI works well in both languages
6. **Consider Text Length**: Chinese text may be longer/shorter than English

## Adding New Languages

To add a new language (e.g., Spanish):

1. Create `src/translations/es.js`
2. Add Spanish translations
3. Update `src/utils/translations.js`:
   ```javascript
   import es from '../translations/es';
   
   const translations = {
     en,
     zh,
     es, // Add new language
   };
   ```
4. Update `getLanguageDisplayName()` function
5. Update language detection logic in `LanguageContext.jsx`

## Browser Language Detection

The system supports these language codes:
- `en` - English
- `zh` - Chinese (Simplified)
- `zh-CN` - Chinese (Simplified, China)
- `zh-TW` - Chinese (Traditional, Taiwan)

## Performance Considerations

- Translations are loaded at build time
- No runtime translation loading
- Minimal performance impact
- localStorage for language persistence

## Troubleshooting

### Missing Translation
If a translation key is missing, the system will:
1. Log a warning to console
2. Display the key name as fallback
3. Continue functioning normally

### Language Not Switching
Check:
1. localStorage for saved language preference
2. Browser language settings
3. Language switcher component functionality

### Translation Not Updating
Ensure:
1. Component is using the `useTranslation` hook
2. Translation key exists in both language files
3. Component re-renders when language changes 