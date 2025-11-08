import { createContext, useContext, ReactNode } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';

export interface Language {
  code: string;
  name: string;
  englishName: string;
}

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'en', name: 'English', englishName: 'English' },
  { code: 'hi', name: 'हिन्दी', englishName: 'Hindi' },
  { code: 'ta', name: 'தமிழ்', englishName: 'Tamil' },
  { code: 'te', name: 'తెలుగు', englishName: 'Telugu' },
  { code: 'ml', name: 'മലയാളം', englishName: 'Malayalam' },
  { code: 'kn', name: 'ಕನ್ನಡ', englishName: 'Kannada' },
  { code: 'bn', name: 'বাংলা', englishName: 'Bengali' },
  { code: 'mr', name: 'मराठी', englishName: 'Marathi' },
  { code: 'gu', name: 'ગુજરાતી', englishName: 'Gujarati' },
  { code: 'pa', name: 'ਪੰਜਾਬੀ', englishName: 'Punjabi' },
  { code: 'es', name: 'Español', englishName: 'Spanish' },
  { code: 'fr', name: 'Français', englishName: 'French' },
  { code: 'de', name: 'Deutsch', englishName: 'German' },
  { code: 'it', name: 'Italiano', englishName: 'Italian' },
  { code: 'ja', name: '日本語', englishName: 'Japanese' },
  { code: 'ko', name: '한국어', englishName: 'Korean' },
  { code: 'zh', name: '中文', englishName: 'Chinese' },
  { code: 'pt', name: 'Português', englishName: 'Portuguese' },
  { code: 'ru', name: 'Русский', englishName: 'Russian' },
  { code: 'ar', name: 'العربية', englishName: 'Arabic' },
];

interface LanguagePreferenceContextType {
  preferredLanguage: Language | null;
  setPreferredLanguage: (language: Language | null) => void;
  checkLanguageAvailability: (availableLanguages: string[]) => {
    isPreferredAvailable: boolean;
    languageToUse: string;
    displayMessage: string;
  };
}

const LanguagePreferenceContext = createContext<LanguagePreferenceContextType | undefined>(undefined);

export const useLanguagePreference = () => {
  const context = useContext(LanguagePreferenceContext);
  if (!context) {
    throw new Error('useLanguagePreference must be used within LanguagePreferenceProvider');
  }
  return context;
};

export const LanguagePreferenceProvider = ({ children }: { children: ReactNode }) => {
  const [preferredLanguage, setPreferredLanguage] = useLocalStorage<Language | null>('preferred-language', null);

  const checkLanguageAvailability = (availableLanguages: string[]) => {
    if (!preferredLanguage) {
      return {
        isPreferredAvailable: false,
        languageToUse: availableLanguages[0] || 'en',
        displayMessage: 'Original Audio',
      };
    }

    const isPreferredAvailable = availableLanguages.some(
      lang => lang.toLowerCase() === preferredLanguage.code.toLowerCase()
    );

    if (isPreferredAvailable) {
      return {
        isPreferredAvailable: true,
        languageToUse: preferredLanguage.code,
        displayMessage: `Available in ${preferredLanguage.englishName}`,
      };
    }

    return {
      isPreferredAvailable: false,
      languageToUse: availableLanguages[0] || 'en',
      displayMessage: `${preferredLanguage.englishName} not available - Original Audio`,
    };
  };

  return (
    <LanguagePreferenceContext.Provider value={{ preferredLanguage, setPreferredLanguage, checkLanguageAvailability }}>
      {children}
    </LanguagePreferenceContext.Provider>
  );
};
