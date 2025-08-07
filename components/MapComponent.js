'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup, Polygon, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { getHazardIcon, hazardTypes, hazardLevels, campusBounds, mapConfig } from '../data/mapData';
import { clusterHazards } from '../utils/clusterUtils';
import '../utils/deprecationFix'; // 導入棄用警告修復
import mapStyles from '../styles/components/map.module.css';
import LoadingSpinner from './LoadingSpinner';
import ClusterMarkers from './ClusterMarkers';

// 修復 Leaflet 圖標問題
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// 自定義圖標工廠函數 - 使用您的自定義圖標
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







const MapComponent = ({ 
  hazards = [], 
  onMapLoad, 
  onMapError, 
  onZoomStart, 
  onZoomEnd,
  onHazardClick 
}) => {
  const mapRef = useRef(null);
  const radarCirclesRef = useRef(new Map()); // 儲存雷達圓圈的參考
  const [isLoading, setIsLoading] = useState(true); // 載入狀態

  // 組件初始載入時的處理
  useEffect(() => {
    // 確保載入狀態為 true
    setIsLoading(true);
    
    // 設置超時保護（5秒後自動隱藏載入動畫）
    const timeoutId = setTimeout(() => {
      setIsLoading(false);
    }, 5000);
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, []); // 只在組件掛載時執行一次

  useEffect(() => {
    // 修復棄用警告：移除舊的 MouseEvent 監聽器
    const handlePointerEvents = () => {
      // 使用 PointerEvent 替代 MouseEvent
      const handlePointerDown = (e) => {
        // 新的 PointerEvent API
        if (e.pressure !== undefined) {
          // 處理壓力感應
        }
      };
      
      document.addEventListener('pointerdown', handlePointerDown, { passive: true });
      
      return () => {
        document.removeEventListener('pointerdown', handlePointerDown);
      };
    };

    const cleanupPointerEvents = handlePointerEvents();

    // 確保地圖標記動畫在組件掛載後正確顯示
    const ensureMarkerAnimations = () => {
      try {
        const markers = document.querySelectorAll('.hazard-marker');
        markers.forEach(marker => {
          if (marker && marker.isConnected) { // 檢查元素是否仍在 DOM 中
            const markerDiv = marker.querySelector('div');
            if (markerDiv && !markerDiv.classList.contains('pulse-animation')) {
              // 使用 CSS 類別而不是內聯樣式，避免衝突
              markerDiv.classList.add('pulse-animation');
            }
          }
        });
      } catch (error) {
        console.warn('確保標記動畫時發生錯誤:', error);
      }
    };

    // 延遲檢查，確保所有標記都已渲染
    const timeoutId1 = setTimeout(ensureMarkerAnimations, 200);
    const timeoutId2 = setTimeout(ensureMarkerAnimations, 500);

    return () => {
      // 清理事件監聽器和定時器
      cleanupPointerEvents();
      clearTimeout(timeoutId1);
      clearTimeout(timeoutId2);
    };
  }, [hazards]); // 當危險項目變化時重新檢查動畫

  // 縮放時重新定位雷達動畫
  useEffect(() => {
    if (!mapRef.current) return;
    
    const map = mapRef.current;
    
    const handleZoomChange = () => {
      console.log('地圖縮放變化，重新定位雷達動畫');
      
      // 使用 requestAnimationFrame 確保在下一幀執行，避免與其他動畫衝突
      requestAnimationFrame(() => {
        // 重新定位所有現有的雷達圓圈
        radarCirclesRef.current.forEach((item, hazardId) => {
          if (item.circle && map.hasLayer(item.circle)) {
            // 找到對應的危險項目
            const hazard = hazards.find(h => h.id === hazardId);
            if (hazard) {
              const exactPosition = L.latLng(hazard.lat, hazard.lng);
              item.circle.setLatLng(exactPosition);
              console.log(`重新定位雷達圓圈 ${hazardId} 到位置:`, exactPosition);
            }
          }
        });
      });
    };
    
    // 監聽縮放事件
    map.on('zoomend', handleZoomChange);
    map.on('viewreset', handleZoomChange);
    map.on('moveend', handleZoomChange); // 移動結束時也重新定位
    
    return () => {
      map.off('zoomend', handleZoomChange);
      map.off('viewreset', handleZoomChange);
      map.off('moveend', handleZoomChange);
    };
  }, [hazards]); // 當危險項目變化時重新設置事件監聽器

  // 雷達動畫效果
  useEffect(() => {
    console.log('雷達動畫 useEffect 觸發，危險項目數量:', hazards.length);
    
    const createRadarAnimations = () => {
      if (!mapRef.current) {
        console.log('地圖實例不存在，等待地圖創建...');
        return;
      }

      const map = mapRef.current;
      console.log('開始創建雷達動畫，過濾後的危險項目:', hazards.map(h => ({ id: h.id, name: h.name, lat: h.lat, lng: h.lng })));
      
      // 清理舊的雷達圓圈
      radarCirclesRef.current.forEach((item) => {
        try {
          if (item.animationId) {
            cancelAnimationFrame(item.animationId);
          }
          if (item.circle && map.hasLayer && map.hasLayer(item.circle)) {
            map.removeLayer(item.circle);
          }
        } catch (error) {
          console.warn('清理雷達圓圈時發生錯誤:', error);
        }
      });
      radarCirclesRef.current.clear();
      
      // 確保地圖投影系統穩定
      if (!map.getCenter || !map.getZoom) {
        console.log('地圖投影系統未準備好，延遲創建雷達動畫');
        return;
      }

      // 為每個危險項目創建雷達動畫
      hazards.forEach((hazard) => {
        try {
          const hazardLevel = hazardLevels[hazard.level];
          const hazardType = hazardTypes[hazard.type];
          
          if (!hazardLevel || !hazardType) {
            console.warn(`危險項目 ${hazard.id} 缺少等級或類型定義:`, hazard);
            return;
          }
          
          // 驗證座標的有效性
          if (typeof hazard.lat !== 'number' || typeof hazard.lng !== 'number' || 
              isNaN(hazard.lat) || isNaN(hazard.lng)) {
            console.warn(`危險項目 ${hazard.id} 座標無效:`, hazard);
            return;
          }
          
          // 使用精確的座標位置，確保與標記完全一致
          const exactPosition = L.latLng(hazard.lat, hazard.lng);
          console.log(`為危險項目 ${hazard.id} (${hazard.name}) 創建雷達圓圈，位置:`, exactPosition);
          
          // 創建雷達圓圈 - 使用與標記完全相同的座標
          const radarCircle = L.circle(exactPosition, {
            radius: 3, // 起始半徑設為 3 公尺，與動畫起始一致
            color: hazardType.color,
            fillColor: hazardType.color,
            fillOpacity: 0.1,
            weight: 1,
            opacity: 0.6
          });

          // 安全地添加到地圖
          if (map && map.hasLayer) {
            radarCircle.addTo(map);
          }

          console.log(`雷達圓圈 ${hazard.id} 已添加到地圖，中心位置:`, exactPosition, '起始半徑: 3m');

          // 創建雷達動畫
          let animationStep = 0;
          let animationId = null;
          
          const animateRadar = () => {
            try {
              const progress = (animationStep % 60) / 60;
              // 確保動畫從 3 公尺開始，擴展到 radarRadius
              const currentRadius = 3 + (hazardLevel.radarRadius - 3) * progress;
              const easeOut = 1 - Math.pow(1 - progress, 2);
              const currentOpacity = Math.max(0, 0.6 * (1 - easeOut));
              const currentFillOpacity = Math.max(0, 0.1 * (1 - easeOut));
              
              if (map.hasLayer && map.hasLayer(radarCircle)) {
                // 使用精確的座標位置，確保與標記完全一致
                // 在動畫過程中持續同步位置，防止縮放導致的偏移
                const exactPosition = L.latLng(hazard.lat, hazard.lng);
                radarCircle.setLatLng(exactPosition);
                radarCircle.setRadius(currentRadius);
                radarCircle.setStyle({
                  opacity: currentOpacity,
                  fillOpacity: currentFillOpacity
                });
              }
              
              animationStep++;
              animationId = requestAnimationFrame(animateRadar);
            } catch (error) {
              console.warn('雷達動畫執行時發生錯誤:', error);
            }
          };
          
          animateRadar();
          
          // 儲存動畫 ID 以便清理
          radarCirclesRef.current.set(hazard.id, { circle: radarCircle, animationId });
        } catch (error) {
          console.warn(`為危險項目 ${hazard.id} 創建雷達動畫時發生錯誤:`, error);
        }
      });
    };

    // 立即嘗試創建雷達動畫
    createRadarAnimations();
    
    // 如果地圖還沒準備好，延遲重試
    if (!mapRef.current) {
      const retryInterval = setInterval(() => {
        if (mapRef.current) {
          console.log('地圖實例已準備好，創建雷達動畫');
          createRadarAnimations();
          clearInterval(retryInterval);
        }
      }, 100);
      
      // 清理定時器
      return () => {
        clearInterval(retryInterval);
        // 清理雷達圓圈和動畫
        if (mapRef.current) {
          const map = mapRef.current;
          radarCirclesRef.current.forEach((item) => {
            try {
              if (item.animationId) {
                cancelAnimationFrame(item.animationId);
              }
              if (item.circle && map.hasLayer && map.hasLayer(item.circle)) {
                map.removeLayer(item.circle);
              }
            } catch (error) {
              console.warn('清理雷達圓圈時發生錯誤:', error);
            }
          });
          radarCirclesRef.current.clear();
        }
      };
    }

    return () => {
      // 清理雷達圓圈和動畫
      if (mapRef.current) {
        const map = mapRef.current;
        radarCirclesRef.current.forEach((item) => {
          try {
            if (item.animationId) {
              cancelAnimationFrame(item.animationId);
            }
            if (item.circle && map.hasLayer && map.hasLayer(item.circle)) {
              map.removeLayer(item.circle);
            }
          } catch (error) {
            console.warn('清理雷達圓圈時發生錯誤:', error);
          }
        });
        radarCirclesRef.current.clear();
      }
    };
  }, [hazards]);



  // 地圖載入完成處理
  const handleMapLoad = useCallback(() => {
    setIsLoading(false);
    
    // 確保地圖標記動畫正常顯示
    const applyMarkerAnimations = () => {
      try {
        const markers = document.querySelectorAll('.hazard-marker');
        markers.forEach((marker, index) => {
          if (marker && marker.isConnected) { // 檢查元素是否仍在 DOM 中
            const markerDiv = marker.querySelector('div');
            if (markerDiv && !markerDiv.classList.contains('pulse-animation')) {
              markerDiv.classList.add('pulse-animation');
            }
          }
        });
      } catch (error) {
        console.warn('應用標記動畫時發生錯誤:', error);
      }
    };

    // 延遲應用動畫，確保所有標記都已渲染
    const timeoutId1 = setTimeout(applyMarkerAnimations, 200);
    const timeoutId2 = setTimeout(applyMarkerAnimations, 500);
    
    if (onMapLoad) {
      onMapLoad();
    }

    // 清理定時器（雖然在這個情況下可能不需要，但為了安全起見）
    return () => {
      clearTimeout(timeoutId1);
      clearTimeout(timeoutId2);
    };
  }, [onMapLoad]);

  // 地圖實例創建處理
  const handleMapCreated = (map) => {
    mapRef.current = map;
    
    // 監聽地圖的 load 事件
    map.on('load', () => {
      handleMapLoad();
    });
    
    // 檢查地圖是否已經載入完成
    if (map.isStyleLoaded && map.isStyleLoaded()) {
      handleMapLoad();
    }
    
    // 延遲檢查地圖載入狀態
    setTimeout(() => {
      if (map && map.getSize && map.getSize().x > 0) {
        handleMapLoad();
      }
    }, 1000);
  };

  // 地圖錯誤處理
  const handleMapError = (error) => {
    console.error('地圖載入錯誤:', error);
    setIsLoading(false);
    if (onMapError) {
      onMapError(error);
    }
  };

  // 縮放開始處理
  const handleZoomStart = () => {
    if (onZoomStart) {
      onZoomStart();
    }
  };

  // 縮放結束處理
  const handleZoomEnd = () => {
    if (onZoomEnd) {
      onZoomEnd();
    }
  };

  // 預設地圖中心點和縮放等級（從 mapConfig 取得）
  const defaultCenter = mapConfig.center;
  const defaultZoom = mapConfig.zoom;

  return (
    <div className={mapStyles.mapContainer}>
      {/* 載入動畫 */}
      {isLoading && <LoadingSpinner />}
      
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        minZoom={mapConfig.minZoom}
        maxZoom={mapConfig.maxZoom}
        style={{ height: '100%', width: '100%', borderRadius: '20px' }}
        ref={mapRef}
        onLoad={handleMapLoad}
        onError={handleMapError}
        onZoomStart={handleZoomStart}
        onZoomEnd={handleZoomEnd}
        className="map-container"
        whenCreated={handleMapCreated}
      >
      {/* 灰階地圖圖層 */}
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        subdomains="abcd"
        maxZoom={19}
        eventHandlers={{
          load: () => {
            handleMapLoad();
          }
        }}
      />

      {/* 校園邊界 */}
      <Polygon
        positions={campusBounds.coordinates}
        pathOptions={{
          color: campusBounds.style.color,
          weight: campusBounds.style.weight,
          fillColor: campusBounds.style.fillColor,
          fillOpacity: campusBounds.style.fillOpacity
        }}
      />
      
      {/* 聚合標記 */}
      <ClusterMarkers hazards={hazards} onHazardClick={onHazardClick} />
      </MapContainer>
    </div>
  );
};

export default MapComponent; 