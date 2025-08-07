'use client';

import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import styles from '../styles/components/layout.module.css';
import { legendData, hasLeveledIcons, getHazardIcon } from '../data/mapData';
import { useTranslation } from '../contexts/LanguageContext';
import { useMapState } from '../hooks/useMapState';
import LanguageSwitcher from '../components/LanguageSwitcher';
import HazardFilter from '../components/HazardFilter';
import HazardList from '../components/HazardList';

// 動態載入地圖組件
const MapComponent = dynamic(() => import('../components/MapComponent'), {
  ssr: false
});

// 圖例組件
const Legend = ({ legendData, hasLeveledIcons, getHazardIcon, t }) => (
  <div className="legend">
    <h3>{t('legend.title')}</h3>
    <div className="legendItems">
      {legendData.hazardTypes.map((type) => (
        <div key={type.key} className="legendItem">
          {hasLeveledIcons(type.key) ? (
            <div className="leveledIcons">
              <span 
                className="hazardIcon"
                style={{ backgroundImage: `url(${getHazardIcon(type.key, 'high')})` }}
                title={`- High Risk ${type.name}`}
              />
              <span 
                className="hazardIcon"
                style={{ backgroundImage: `url(${getHazardIcon(type.key, 'medium')})` }}
                title={`- Medium Risk ${type.name}`}
              />
              <span 
                className="hazardIcon"
                style={{ backgroundImage: `url(${getHazardIcon(type.key, 'low')})` }}
                title={`- Low Risk ${type.name}`}
              />
            </div>
          ) : (
            <span 
              className="hazardIcon"
              style={{ backgroundImage: `url(${type.icon})` }}
            />
          )}
          <span>{t(`hazardTypes.${type.key}`)}</span>
        </div>
      ))}
    </div>
    <div className="legendLevels">
      {legendData.hazardLevels.map((level) => (
        <div key={level.key} className="legendLevel">
          <div 
            className={`levelDot ${level.key}`}
            style={{ backgroundColor: level.color }}
          />
          <span>{t(`hazardLevels.${level.key}`)}</span>
        </div>
      ))}
    </div>
  </div>
);

export default function Home() {
  const { t, isLoading } = useTranslation();
  
  // 使用自定義 Hook 管理地圖狀態
  const {
    selectedHazard,
    filteredHazards,
    mapLoaded,
    error,
    isZooming,
    hazardStats,
    hasActiveFilters,
    activeHazardCount,
    handleHazardFilter,
    handleMapLoad,
    handleMapError,
    handleZoomStart,
    handleZoomEnd
  } = useMapState();

  // 使用 useMemo 優化圖例渲染
  const legendComponent = useMemo(() => (
    <Legend 
      legendData={legendData} 
      hasLeveledIcons={hasLeveledIcons} 
      getHazardIcon={getHazardIcon} 
      t={t} 
    />
  ), [t]);

  // 處理危險項目點擊
  const handleHazardClick = (hazard) => {
    console.log('點擊危險項目:', hazard);
    // 這裡可以添加地圖定位到該危險項目的邏輯
  };

  // 如果正在載入語言檔案，顯示簡潔的載入狀態
  if (isLoading) {
    return (
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <h1 className={styles.title}>NTUT 危險地圖</h1>
            <LanguageSwitcher />
          </div>
        </header>
        <div className={styles.mainContent}>
          <div>
            <div className="map-loading">載入中...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* 標題列 */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>{t('header.title')}</h1>
          <LanguageSwitcher />
        </div>
      </header>

      {/* 主要內容區域 */}
      <div className={styles.mainContent}>
        {/* 地圖區域 */}
        <div>
          {error ? (
            <div className="map-error">
              地圖載入錯誤: {error}
            </div>
          ) : (
            <MapComponent 
              hazards={filteredHazards}
              onMapLoad={handleMapLoad}
              onMapError={handleMapError}
              onZoomStart={handleZoomStart}
              onZoomEnd={handleZoomEnd}
            />
          )}
        </div>

        {/* 側邊 UI 面板 */}
        <div className={styles.sidebar}>
          {/* 危險類型篩選 */}
          <HazardFilter 
            selectedHazard={selectedHazard}
            onHazardFilter={handleHazardFilter}
            hazardStats={hazardStats}
          />

          {/* 危險區域列表 */}
          <HazardList 
            hazards={filteredHazards}
            onHazardClick={handleHazardClick}
          />

          {/* 圖例 */}
          {legendComponent}
        </div>
      </div>
    </div>
  );
};
