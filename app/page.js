'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import styles from './page.module.css';
import { hazardData, hazardTypes, hazardLevels, legendData } from '../data/mapData';

// 動態導入地圖組件以避免 SSR 問題
const MapComponent = dynamic(() => import('../components/MapComponent'), {
  ssr: false,
  loading: () => <div className={styles.mapLoading}>載入地圖中...</div>
});

export default function Home() {
  const [selectedHazard, setSelectedHazard] = useState('all');

  // 使用資料庫中的危險區域資料
  const filteredHazards = selectedHazard === 'all' 
    ? hazardData 
    : hazardData.filter(hazard => hazard.type === selectedHazard);

  return (
    <div className={styles.container}>
      {/* 標題列 */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>NTUT Hazzard Map</h1>
        </div>
      </header>

      {/* 主要內容區域 */}
      <div className={styles.mainContent}>
        {/* 地圖區域 */}
        <div className={styles.mapContainer}>
          <MapComponent hazards={filteredHazards} />
        </div>

        {/* 側邊 UI 面板 */}
        <div className={styles.sidebar}>
          {/* 危險類型篩選 */}
          <div className={styles.filterSection}>
            <h3>Danger Type Filter</h3>
            <div className={styles.filterOptions}>
              <button 
                className={`${styles.filterBtn} ${selectedHazard === 'all' ? styles.active : ''}`}
                onClick={() => setSelectedHazard('all')}
              >
                All Types
              </button>
              {Object.entries(hazardTypes).map(([key, value]) => (
                <button 
                  key={key}
                  className={`${styles.filterBtn} ${selectedHazard === key ? styles.active : ''}`}
                  onClick={() => setSelectedHazard(key)}
                  style={{ borderLeftColor: value.color }}
                >
                  <span className={styles.hazardIcon}>{value.icon}</span>
                  {value.name}
                </button>
              ))}
            </div>
          </div>

          {/* 危險區域列表 */}
          <div className={styles.hazardList}>
            <h3>Dangerous Zone List</h3>
            <div className={styles.hazardItems}>
              {filteredHazards.map(hazard => (
                <div key={hazard.id} className={styles.hazardItem}>
                  <div className={styles.hazardInfo}>
                    <span className={styles.hazardIcon}>
                      {hazardTypes[hazard.type].icon}
                    </span>
                    <div>
                      <h4>{hazard.name}</h4>
                      <p className={styles.hazardType}>{hazardTypes[hazard.type].name}</p>
                      <p className={styles.hazardBuilding}>{hazard.building || '未指定建築'}</p>
                    </div>
                  </div>
                  <div className={`${styles.hazardLevel} ${styles[hazard.level]}`}>
                    {hazardLevels[hazard.level].displayText}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 圖例 */}
          <div className={styles.legend}>
            <h3>Legend</h3>
            <div className={styles.legendItems}>
              {legendData.hazardTypes.map((type) => (
                <div key={type.key} className={styles.legendItem}>
                  <div 
                    className={styles.legendColor} 
                    style={{ backgroundColor: type.color }}
                  ></div>
                  <span>{type.name}</span>
                </div>
              ))}
            </div>
            <div className={styles.legendLevels}>
              {legendData.hazardLevels.map((level) => (
                <div key={level.key} className={styles.legendLevel}>
                  <div 
                    className={`${styles.levelDot} ${styles[level.key]}`}
                    style={{ backgroundColor: level.color }}
                  ></div>
                  <span>{level.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
