'use client';

import { useEffect, useState } from 'react';
import { useMap, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { clusterHazards } from '../utils/clusterUtils';
import { getHazardIcon, hazardTypes, hazardLevels } from '../data/mapData';
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

const ClusterMarkers = ({ hazards, onHazardClick }) => {
  const map = useMap();
  const [clusters, setClusters] = useState([]);

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
            <div className="hazard-popup">
              <h3 style={{ 
                color: hazardType.color, 
                marginBottom: '8px',
                fontSize: '1.1rem',
                borderBottom: `2px solid ${hazardType.color}`,
                paddingBottom: '6px'
              }}>
                {hazard.name}
              </h3>
              <div style={{ 
                marginBottom: '8px',
                color: 'var(--text-primary)'
              }}>
                <strong>類型:</strong> {hazardType.name}
              </div>
              <div style={{ 
                marginBottom: '8px',
                color: hazardLevel.color,
                fontWeight: 'bold'
              }}>
                <strong>風險等級:</strong> {hazardLevel.name}
              </div>
              <div style={{ 
                marginBottom: '8px',
                color: 'var(--text-primary)'
              }}>
                <strong>建築物:</strong> {hazard.building || '未指定'}
              </div>
              {hazard.description && (
                <div style={{ 
                  fontSize: '0.9rem', 
                  color: 'var(--text-secondary)',
                  marginTop: '8px',
                  padding: '8px',
                  backgroundColor: 'var(--surface-light)',
                  borderRadius: '4px'
                }}>
                  {hazard.description}
                </div>
              )}
            </div>
          </Popup>
        </Marker>
      );
    }
  });
};

export default ClusterMarkers; 