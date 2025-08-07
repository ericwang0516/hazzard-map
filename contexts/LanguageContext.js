'use client';

import { createContext, useContext, useState, useEffect } from 'react';

// 建立語言 Context
const LanguageContext = createContext();

// 支援的語言列表
export const supportedLanguages = {
  'zh-TW': '繁體中文',
  'en': 'English', 
  'ja': '日本語'
};

// 語言 Context Provider
export function LanguageProvider({ children }) {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [translations, setTranslations] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // 載入語言檔案
  useEffect(() => {
    const loadTranslations = async () => {
      setIsLoading(true);
      try {
        const translationModule = await import(`../locales/${currentLanguage}.json`);
        setTranslations(translationModule.default);
      } catch (error) {
        console.error('Error loading translations:', error);
        // 如果載入失敗，使用預設英文
        const fallbackModule = await import('../locales/en.json');
        setTranslations(fallbackModule.default);
      } finally {
        setIsLoading(false);
      }
    };

    loadTranslations();
  }, [currentLanguage]);

  // 切換語言
  const changeLanguage = (languageCode) => {
    if (supportedLanguages[languageCode]) {
      setCurrentLanguage(languageCode);
      // 儲存到 localStorage
      localStorage.setItem('preferredLanguage', languageCode);
    }
  };

  // 初始化語言設定
  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferredLanguage');
    if (savedLanguage && supportedLanguages[savedLanguage]) {
      setCurrentLanguage(savedLanguage);
    }
  }, []);

  const value = {
    currentLanguage,
    translations,
    changeLanguage,
    supportedLanguages,
    isLoading
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

// 使用語言 Context 的 Hook
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage 必須在 LanguageProvider 內使用');
  }
  return context;
}

// 翻譯 Hook
export function useTranslation() {
  const { translations, isLoading } = useLanguage();
  
  const t = (key) => {
    // 如果正在載入，提供預設翻譯
    if (isLoading) {
      const defaultTranslations = {
        'header.title': 'NTUT 危險地圖',
        'common.loading': '載入中...',
        'filters.title': '危險類型篩選',
        'filters.allTypes': '所有類型',
        'hazardList.title': '危險區域列表',
        'legend.title': '圖例',
        'hazardTypes.chemical': '化學品',
        'hazardTypes.mechanical': '機械設備',
        'hazardTypes.electrical': '電氣設備',
        'hazardTypes.storage': '儲存設施',
        'hazardLevels.high': '高風險',
        'hazardLevels.medium': '中風險',
        'hazardLevels.low': '低風險',
        'common.noBuildingSpecified': '未指定建築物'
      };
      
      return defaultTranslations[key] || key;
    }
    
    const keys = key.split('.');
    let value = translations;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key; // 如果找不到翻譯，返回原始 key
      }
    }
    
    return value || key;
  };

  return { t, isLoading };
} 