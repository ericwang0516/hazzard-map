'use client';

import { useState } from 'react';
import { useTranslation } from '../contexts/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';
import Navigation from './Navigation';
import styles from '../styles/components/storage-system.module.css';

// 存放類別資料
const storageCategories = [
  { id: 'chemical', name: 'chemical', icon: '🧪' },
  { id: 'electrical', name: 'electrical', icon: '⚡' },
  { id: 'mechanical', name: 'mechanical', icon: '🔧' },
  { id: 'storage', name: 'storage', icon: '📦' }
];

// 模擬存放資料
const storageData = {
  chemical: [
    { id: 1, building: '工程一館', room: 'E1-101', itemKey: 'sulfuric_acid', amount: 500, unit: 'ml', risk: 'high' },
    { id: 2, building: '工程一館', room: 'E1-102', itemKey: 'hydrochloric_acid', amount: 1, unit: 'l', risk: 'high' },
    { id: 3, building: '工程二館', room: 'E2-201', itemKey: 'sodium_hydroxide', amount: 500, unit: 'g', risk: 'medium' },
    { id: 4, building: '工程二館', room: 'E2-202', itemKey: 'ethanol', amount: 2, unit: 'l', risk: 'low' }
  ],
  electrical: [
    { id: 1, building: '電資大樓', room: 'EE-301', itemKey: 'high_voltage_power', amount: 1, unit: 'unit', risk: 'high' },
    { id: 2, building: '電資大樓', room: 'EE-302', itemKey: 'transformer', amount: 2, unit: 'unit', risk: 'medium' },
    { id: 3, building: '工程一館', room: 'E1-301', itemKey: 'circuit_board', amount: 50, unit: 'piece', risk: 'low' }
  ],
  mechanical: [
    { id: 1, building: '機械大樓', room: 'ME-101', itemKey: 'cutting_machine', amount: 1, unit: 'unit', risk: 'high' },
    { id: 2, building: '機械大樓', room: 'ME-102', itemKey: 'drill_press', amount: 2, unit: 'unit', risk: 'medium' },
    { id: 3, building: '工程一館', room: 'E1-401', itemKey: 'hand_tool_set', amount: 10, unit: 'set', risk: 'low' }
  ],
  storage: [
    { id: 1, building: '倉庫A', room: 'A-01', itemKey: 'chemical_storage_cabinet', amount: 5, unit: 'piece_count', risk: 'high' },
    { id: 2, building: '倉庫B', room: 'B-02', itemKey: 'equipment_storage_area', amount: 1, unit: 'area', risk: 'medium' },
    { id: 3, building: '工程一館', room: 'E1-501', itemKey: 'tool_storage_cabinet', amount: 3, unit: 'piece_count', risk: 'low' }
  ]
};

// 風險等級顏色
const riskColors = {
  high: '#dc3545',
  medium: '#ffc107',
  low: '#28a745'
};

export default function StorageSystem() {
  const { t, isLoading } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState('chemical');

  // 如果正在載入語言檔案，顯示載入狀態
  if (isLoading) {
    return (
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <h1 className={styles.title}>{t('pages.storage.title')}</h1>
            <div className={styles.headerRight}>
              <Navigation />
              <LanguageSwitcher />
            </div>
          </div>
        </header>
        <div className={styles.mainContent}>
          <div className={styles.loading}>載入中...</div>
        </div>
      </div>
    );
  }

  const currentData = storageData[selectedCategory] || [];

  return (
    <div className={styles.container}>
      {/* 標題列 */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>{t('pages.storage.title')}</h1>
          <div className={styles.headerRight}>
            <Navigation />
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      {/* 主要內容區域 */}
      <div className={styles.mainContent}>
        {/* 左側類別選擇 */}
        <div className={styles.sidebar}>
          <h2 className={styles.sidebarTitle}>{t('storage.categoryTitle')}</h2>
          <div className={styles.categoryList}>
            {storageCategories.map((category) => (
              <button
                key={category.id}
                className={`${styles.categoryButton} ${
                  selectedCategory === category.id ? styles.active : ''
                }`}
                onClick={() => setSelectedCategory(category.id)}
              >
                <span className={styles.categoryIcon}>{category.icon}</span>
                <span className={styles.categoryName}>
                  {t(`hazardTypes.${category.name}`)}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* 右側存放資料 */}
        <div className={styles.content}>
          <div className={styles.contentHeader}>
            <h2 className={styles.contentTitle}>
              {t(`hazardTypes.${selectedCategory}`)} {t('storage.contentTitle')}
            </h2>
            <div className={styles.itemCount}>
              {t('storage.itemCount').replace('{count}', currentData.length)}
            </div>
          </div>

          <div className={styles.storageList}>
            {currentData.length > 0 ? (
              currentData.map((item) => (
                <div key={item.id} className={styles.storageItem}>
                  <div className={styles.itemHeader}>
                    <h3 className={styles.itemName}>{t(`items.${item.itemKey}`)}</h3>
                    <span 
                      className={styles.riskBadge}
                      style={{ backgroundColor: riskColors[item.risk] }}
                    >
                      {t(`hazardLevels.${item.risk}`)}
                    </span>
                  </div>
                  <div className={styles.itemDetails}>
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>{t('storage.building')}：</span>
                      <span className={styles.detailValue}>{item.building}</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>{t('storage.room')}：</span>
                      <span className={styles.detailValue}>{item.room}</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>{t('storage.quantity')}：</span>
                      <span className={styles.detailValue}>{item.amount}{t(`units.${item.unit}`)}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>📦</div>
                <p>{t('storage.noData')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};