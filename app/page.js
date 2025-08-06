'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import styles from './page.module.css';
import { hazardData, hazardTypes, hazardLevels, legendData, getHazardIcon, hasLeveledIcons, getTypeIcons } from '../data/mapData';

const MapComponent = dynamic(() => import('../components/MapComponent'), {
  ssr: false,
  loading: () => <div className={styles.mapLoading}>Loading Map...</div>
});

export default function Home() {
  const [selectedHazard, setSelectedHazard] = useState('all');

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
                  <span 
                    className={styles.hazardIcon}
                    style={{ backgroundImage: `url(${value.icon})` }}
                  ></span>
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
                    <span 
                      className={styles.hazardIcon}
                      style={{ backgroundImage: `url(${getHazardIcon(hazard.type, hazard.level)})` }}
                    ></span>
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
              {/* 動態顯示所有危險類型 */}
              {legendData.hazardTypes.map((type) => (
                <div key={type.key} className={styles.legendItem}>
                  {hasLeveledIcons(type.key) ? (
                    // 如果有等級化圖示，顯示所有等級
                    <div className={styles.leveledIcons}>
                      <span 
                        className={styles.hazardIcon}
                        style={{ backgroundImage: `url(${getHazardIcon(type.key, 'high')})` }}
                        title={`High Risk ${type.name}`}
                      ></span>
                      <span 
                        className={styles.hazardIcon}
                        style={{ backgroundImage: `url(${getHazardIcon(type.key, 'medium')})` }}
                        title={`Medium Risk ${type.name}`}
                      ></span>
                      <span 
                        className={styles.hazardIcon}
                        style={{ backgroundImage: `url(${getHazardIcon(type.key, 'low')})` }}
                        title={`Low Risk ${type.name}`}
                      ></span>
                    </div>
                  ) : (
                    // 如果沒有等級化圖示，顯示單一圖示
                    <span 
                      className={styles.hazardIcon}
                      style={{ backgroundImage: `url(${type.icon})` }}
                    ></span>
                  )}
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
};
