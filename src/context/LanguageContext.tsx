import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'hi';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    'nav.home': 'Home',
    'nav.scan': 'Scan',
    'nav.mandi': 'Mandi',
    'nav.history': 'History',
    'nav.login': 'Login',
    'nav.logout': 'Logout',
    'hero.title': 'Agro-Nexus',
    'hero.subtitle': 'AI-Powered Crop Disease Detection & Mandi Analytics',
    'hero.cta': 'Start Scanning',
    'scan.title': 'Crop Disease Scanner',
    'scan.upload': 'Upload Leaf Photo',
    'scan.capture': 'Capture Photo',
    'scan.detecting': 'Detecting Disease...',
    'scan.result': 'Scan Result',
    'scan.confidence': 'Confidence',
    'scan.solution': 'Recommended Solution',
    'mandi.title': 'Real-time Mandi Analytics',
    'mandi.search': 'Search Commodity...',
    'mandi.price_trend': 'Price Trend (Last 7 Days)',
    'mandi.current_price': 'Current Price',
    'mandi.best_price': 'Best Price',
    'mandi.market': 'Market',
    'mandi.variety': 'Variety',
    'mandi.min_max': 'Min/Max Price',
    'mandi.near_you': 'Mandis Near You',
    'mandi.favorites': 'Favorite Mandis',
    'mandi.all': 'All Mandis',
    'mandi.no_favorites': 'No favorite mandis yet. Star them for quick access!',
    'mandi.offline': 'Offline Mode: Showing cached prices',
    'mandi.last_updated': 'Last Updated',
    'mandi.quintal': 'Quintal',
    'history.title': 'Scan History',
    'history.empty': 'No scans found.',
    'auth.welcome': 'Welcome to Agro-Nexus',
    'auth.signin': 'Sign in with Google',
    'auth.tagline': 'Empowering farmers with AI and real-time data.'
  },
  hi: {
    'nav.home': 'Home',
    'nav.scan': 'Scan',
    'nav.mandi': 'Mandi',
    'nav.history': 'History',
    'nav.login': 'Login',
    'nav.logout': 'Logout',
    'hero.title': 'Agro-Nexus',
    'hero.subtitle': 'AI-Powered Crop Disease Detection & Mandi Analytics',
    'hero.cta': 'Start Scanning',
    'scan.title': 'Crop Disease Scanner',
    'scan.upload': 'Upload Leaf Photo',
    'scan.capture': 'Capture Photo',
    'scan.detecting': 'Detecting Disease...',
    'scan.result': 'Scan Result',
    'scan.confidence': 'Confidence',
    'scan.solution': 'Recommended Solution',
    'mandi.title': 'Real-time Mandi Analytics',
    'mandi.search': 'Search Commodity...',
    'mandi.price_trend': 'Price Trend (Last 7 Days)',
    'mandi.current_price': 'Current Price',
    'mandi.best_price': 'Best Price',
    'mandi.market': 'Market',
    'mandi.variety': 'Variety',
    'mandi.min_max': 'Min/Max Price',
    'mandi.near_you': 'Mandis Near You',
    'mandi.favorites': 'Favorite Mandis',
    'mandi.all': 'All Mandis',
    'mandi.no_favorites': 'No favorite mandis yet. Star them for quick access!',
    'mandi.offline': 'Offline Mode: Showing cached prices',
    'mandi.last_updated': 'Last Updated',
    'mandi.quintal': 'Quintal',
    'history.title': 'Scan History',
    'history.empty': 'No scans found.',
    'auth.welcome': 'Welcome to Agro-Nexus',
    'auth.signin': 'Sign in with Google',
    'auth.tagline': 'Empowering farmers with AI and real-time data.'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('agro-nexus-lang');
    return (saved as Language) || 'en';
  });

  useEffect(() => {
    localStorage.setItem('agro-nexus-lang', language);
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['en']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};
