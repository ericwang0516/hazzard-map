'use client';

import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import styles from '../styles/components/language-switcher.module.css';

export default function LanguageSwitcher() {
  const { currentLanguage, changeLanguage, supportedLanguages } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // 點擊外部關閉下拉選單
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

  // 切換語言
  const handleLanguageChange = (languageCode) => {
    changeLanguage(languageCode);
    setIsOpen(false);
  };

  // 取得當前語言顯示名稱
  const getCurrentLanguageName = () => {
    return supportedLanguages[currentLanguage] || currentLanguage;
  };

  // 地球 SVG 圖示
  const GlobeIcon = () => (
    <svg 
      width="20" 
      height="20" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10"/>
      <line x1="2" y1="12" x2="22" y2="12"/>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  );

  return (
    <div className={styles.languageSwitcher} ref={dropdownRef}>
      <button
        className={styles.languageButton}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="切換語言"
      >
        <span className={styles.languageIcon}>
          <GlobeIcon />
        </span>
        <span className={styles.languageText}>
          {getCurrentLanguageName()}
        </span>
        <span className={`${styles.dropdownArrow} ${isOpen ? styles.rotated : ''}`}>
          ▼
        </span>
      </button>

      {isOpen && (
        <div className={styles.dropdownMenu}>
          {Object.entries(supportedLanguages).map(([code, name]) => (
            <button
              key={code}
              className={`${styles.languageOption} ${currentLanguage === code ? styles.active : ''}`}
              onClick={() => handleLanguageChange(code)}
            >
              <span className={styles.languageIcon}>
                <GlobeIcon />
              </span>
              <span className={styles.languageName}>
                {name}
              </span>
              {currentLanguage === code && (
                <span className={styles.checkmark}>✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
} 