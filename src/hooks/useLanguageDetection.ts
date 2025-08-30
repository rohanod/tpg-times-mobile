import { useState, useEffect } from 'react';
import { Platform } from 'react-native';

export type SupportedLanguage = 'en' | 'fr';

export const useLanguageDetection = (): SupportedLanguage => {
  const [language, setLanguage] = useState<SupportedLanguage>('en');

  useEffect(() => {
    const detectLanguage = (): SupportedLanguage => {
      try {
        // For web/PWA environment
        if (Platform.OS === 'web' && typeof navigator !== 'undefined') {
          const browserLang = navigator.language.toLowerCase();

          // Check if French (fr, fr-FR, fr-CA, etc.)
          if (browserLang.startsWith('fr')) {
            return 'fr';
          }

          // Default to English for all other languages
          return 'en';
        }

        // For React Native, we could add device language detection here
        // For now, default to English
        return 'en';
      } catch (error) {
        console.warn('Language detection failed:', error);
        return 'en';
      }
    };

    const detectedLanguage = detectLanguage();
    setLanguage(detectedLanguage);
  }, []);

  return language;
};

// Utility function to get language synchronously (useful for non-hook contexts)
export const getCurrentLanguage = (): SupportedLanguage => {
  try {
    if (Platform.OS === 'web' && typeof navigator !== 'undefined') {
      const browserLang = navigator.language.toLowerCase();
      return browserLang.startsWith('fr') ? 'fr' : 'en';
    }
    return 'en';
  } catch (error) {
    return 'en';
  }
};
