'use client';

import { useEffect, useState } from 'react';
import { useMap, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { clusterHazards } from '../utils/clusterUtils';
import { getHazardIcon, hazardTypes, hazardLevels } from '../data/mapData';
import { useTranslation } from '../contexts/LanguageContext';
import ClusterMarker from './ClusterMarker';

// 自定義圖標工廠函數
const createCustomIcon = (hazard) => {
  const { type, level } = hazard;
  const iconPath = getHazardIcon(type, level);
  const hazardType = hazardTypes[type];
  const hazardLevel = hazardLevels[level];
  
  const iconSize = hazardLevel.size * 2;
  
  return L.icon({
    iconUrl: iconPath,
    iconSize: [iconSize, iconSize], // 根據危險等級調整大小
    iconAnchor: [iconSize / 2, iconSize / 2], // 圖標錨點設為中心點，確保與雷達動畫位置一致
    popupAnchor: [0, -iconSize / 2], // 彈出視窗位置調整
    className: `hazard-marker hazard-marker-${type}-${level}` // 自定義 CSS 類別
  });
};

// 修復棄用警告的點擊處理器
const createClickHandler = (hazard, onHazardClick) => {
  return (e) => {
    // 使用 PointerEvent 替代 MouseEvent
    const pointerEvent = e.originalEvent;
    if (pointerEvent && pointerEvent.pressure !== undefined) {
      // 使用新的 PointerEvent API
      console.log('Pointer pressure:', pointerEvent.pressure);
      console.log('Pointer type:', pointerEvent.pointerType);
    }
    
    if (onHazardClick) {
      onHazardClick(hazard);
    }
  };
};

const ClusterMarkers = ({ hazards, onHazardClick, onRouteRequest }) => {
  const map = useMap();
  const [clusters, setClusters] = useState([]);
  const { t } = useTranslation();

  useEffect(() => {
    if (!map) return;
    
    const zoomLevel = map.getZoom();
    const newClusters = clusterHazards(hazards, zoomLevel);
    setClusters(newClusters);
  }, [hazards, map]);

  // 監聽縮放變化
  useEffect(() => {
    if (!map) return;
    
    const handleZoomEnd = () => {
      try {
        const zoomLevel = map.getZoom();
        const newClusters = clusterHazards(hazards, zoomLevel);
        setClusters(newClusters);
      } catch (error) {
        console.warn('處理縮放變化時發生錯誤:', error);
      }
    };

    map.on('zoomend', handleZoomEnd);
    return () => {
      try {
        map.off('zoomend', handleZoomEnd);
      } catch (error) {
        console.warn('清理縮放事件監聽器時發生錯誤:', error);
      }
    };
  }, [hazards, map]);

  const handleClusterClick = (cluster) => {
    try {
      if (cluster.count === 1) {
        // 單個項目，直接觸發點擊事件
        onHazardClick && onHazardClick(cluster.hazards[0]);
      } else {
        // 多個項目，可以考慮縮放到聚合區域
        const bounds = L.latLngBounds(cluster.hazards.map(h => [h.lat, h.lng]));
        map.fitBounds(bounds, { padding: [20, 20] });
      }
    } catch (error) {
      console.warn('處理聚合點擊時發生錯誤:', error);
    }
  };

  return clusters.map((cluster, index) => {
    if (cluster.type === 'cluster') {
      return (
        <ClusterMarker
          key={`cluster-${index}`}
          cluster={cluster}
          onClusterClick={handleClusterClick}
        />
      );
    } else {
      // 單個標記
      const hazard = cluster.hazards[0];
      const customIcon = createCustomIcon(hazard);
      const hazardType = hazardTypes[hazard.type];
      const hazardLevel = hazardLevels[hazard.level];
      
      return (
        <Marker
          key={hazard.id}
          position={[hazard.lat, hazard.lng]}
          icon={customIcon}
          eventHandlers={{
            click: createClickHandler(hazard, onHazardClick)
          }}
        >
          <Popup>
            <div className="hazard-popup" style={{
              backgroundColor: `${hazardLevel.color}15`, // 使用危險等級顏色的透明度版本作為背景
              border: `2px solid ${hazardLevel.color}`,
              borderRadius: '12px',
              width: '100%',
              boxSizing: 'border-box',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <h3 style={{
                color: hazardLevel.color,
                fontSize: 'clamp(0.9rem, 3.5vw, 1.2rem)',
                fontWeight: 'bold',
                borderBottom: `2px solid ${hazardLevel.color}`,
                padding: 'clamp(6px, 1.5vw, 8px)',
                wordBreak: 'break-word',
                lineHeight: '1.3',
                overflowWrap: 'break-word',
                margin: 0
              }}>
                {hazard.name}
              </h3>
              <div style={{
                color: 'var(--text-primary)',
                fontSize: 'clamp(0.8rem, 3vw, 0.95rem)',
                lineHeight: '1.4',
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
                padding: 'clamp(6px, 1.5vw, 8px)',
                margin: 0
              }}>
                <strong>類型:</strong> {t(`hazardTypes.${hazard.type}`)}
              </div>
              <div style={{
                color: hazardLevel.color,
                fontWeight: 'bold',
                fontSize: 'clamp(0.8rem, 3vw, 0.95rem)',
                lineHeight: '1.4',
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
                padding: 'clamp(6px, 1.5vw, 8px)',
                margin: 0
              }}>
                <strong>風險等級:</strong> {t(`hazardLevels.${hazard.level}`)}
              </div>
              <div style={{
                color: 'var(--text-primary)',
                fontSize: 'clamp(0.8rem, 3vw, 0.95rem)',
                lineHeight: '1.4',
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
                padding: 'clamp(6px, 1.5vw, 8px)',
                margin: 0
              }}>
                <strong>建築物:</strong> {hazard.building || t('common.noBuildingSpecified')}
              </div>
              {hazard.description && (
                <div style={{
                  fontSize: 'clamp(0.75rem, 2.5vw, 0.9rem)',
                  color: 'var(--text-secondary)',
                  padding: 'clamp(8px, 2vw, 10px)',
                  backgroundColor: 'rgba(255, 255, 255, 0.7)',
                  borderRadius: '6px',
                  border: '1px solid rgba(0, 0, 0, 0.1)',
                  lineHeight: '1.4',
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word',
                  margin: 'clamp(6px, 1.5vw, 8px)'
                }}>
                  {hazard.description}
                </div>
              )}
              
              {/* 按鈕區域 */}
              <div className="hazard-actions" style={{
                display: 'flex',
                gap: 'clamp(6px, 1.5vw, 8px)',
                flexDirection: 'row',
                flexWrap: 'wrap',
                justifyContent: 'flex-start',
                padding: 'clamp(6px, 1.5vw, 8px)',
                margin: 0,
                width: '100%',
                boxSizing: 'border-box'
              }}>
                <button
                  style={{
                    flex: 1,
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    padding: 'clamp(6px, 1.5vw, 8px) clamp(8px, 2vw, 12px)',
                    fontSize: 'clamp(0.8rem, 2.5vw, 0.9rem)',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s ease',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                    minHeight: 'clamp(32px, 8vw, 40px)',
                    whiteSpace: 'nowrap'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#218838'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#28a745'}
                  onClick={() => onRouteRequest?.(hazard)}
                >
                  {t('popup.route')}
                </button>
                <button
                  style={{
                    flex: 1,
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    padding: 'clamp(6px, 1.5vw, 8px) clamp(8px, 2vw, 12px)',
                    fontSize: 'clamp(0.8rem, 2.5vw, 0.9rem)',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s ease',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                    minHeight: 'clamp(32px, 8vw, 40px)',
                    whiteSpace: 'nowrap'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#5a6268'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#6c757d'}
                  onClick={() => {
                    // 關閉彈出視窗
                    if (map) {
                      map.closePopup();
                    }
                  }}
                >
                  {t('popup.close')}
                </button>
              </div>
            </div>
          </Popup>
        </Marker>
      );
    }
  });
};

export default ClusterMarkers; 