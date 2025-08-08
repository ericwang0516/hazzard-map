'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup, Polygon, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { getHazardIcon, hazardTypes, hazardLevels, campusBounds, mapConfig, evacuationPoints, evacuationIconPaths, buildings } from '../data/mapData';
import { useTranslation } from '../contexts/LanguageContext';
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
  const { t } = useTranslation();
  const mapRef = useRef(null);
  const radarCirclesRef = useRef(new Map()); // 儲存雷達圓圈的參考
  const [isLoading, setIsLoading] = useState(true); // 載入狀態
  const routeLayerRef = useRef(null); // 路徑圖層
  const evacuationMarkersRef = useRef(new Map()); // 疏散點標記索引（id -> marker）

  // 將校園邊界轉為簡單的經緯度陣列
  const campusPolygon = campusBounds.coordinates.map(([lat, lng]) => ({ lat, lng }));

  // 工具：判斷點是否在多邊形內（射線法）
  const isPointInPolygon = (point, polygon) => {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].lng, yi = polygon[i].lat;
      const xj = polygon[j].lng, yj = polygon[j].lat;
      const intersect = ((yi > point.lat) !== (yj > point.lat)) &&
        (point.lng < (xj - xi) * (point.lat - yi) / (yj - yi + 1e-12) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  };

  // 工具：計算兩點之間的近似距離（公尺）
  const approximateDistanceMeters = (a, b) => {
    const toRad = (d) => d * Math.PI / 180;
    const R = 6371000;
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const lat1 = toRad(a.lat);
    const lat2 = toRad(b.lat);
    const h = Math.sin(dLat/2)**2 + Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLng/2)**2;
    return 2 * R * Math.asin(Math.sqrt(h));
  };

  // 在校園內以粗網格 + A* 規劃避開建物點緩衝區的路線
  const computeCampusRouteAvoidingBuildings = (from, to, buildingPoints) => {
    try {
      // 取邊界包圍盒
      let minLat = Infinity, maxLat = -Infinity, minLng = Infinity, maxLng = -Infinity;
      campusPolygon.forEach(p => { minLat = Math.min(minLat, p.lat); maxLat = Math.max(maxLat, p.lat); minLng = Math.min(minLng, p.lng); maxLng = Math.max(maxLng, p.lng); });
      // 為避免邊界緊貼，擴張一點點
      const latMargin = (maxLat - minLat) * 0.05;
      const lngMargin = (maxLng - minLng) * 0.05;
      minLat -= latMargin; maxLat += latMargin; minLng -= lngMargin; maxLng += lngMargin;

      const rows = 50; // 網格解析度（可調）
      const cols = 50;
      const latStep = (maxLat - minLat) / (rows - 1);
      const lngStep = (maxLng - minLng) / (cols - 1);

      // 建物緩衝半徑（公尺）
      const buildingBufferM = 25;

      // 建立阻擋表
      const blocked = new Array(rows);
      for (let r = 0; r < rows; r++) {
        blocked[r] = new Array(cols).fill(false);
        for (let c = 0; c < cols; c++) {
          const lat = minLat + r * latStep;
          const lng = minLng + c * lngStep;
          const pt = { lat, lng };
          // 僅允許在多邊形內的格點
          if (!isPointInPolygon(pt, campusPolygon)) {
            blocked[r][c] = true;
            continue;
          }
          // 距離任一建物點過近則阻擋
          for (const b of buildingPoints) {
            const d = approximateDistanceMeters(pt, { lat: b.lat, lng: b.lng });
            if (d <= buildingBufferM) {
              blocked[r][c] = true;
              break;
            }
          }
        }
      }

      const toIndex = (lat, lng) => {
        const r = Math.max(0, Math.min(rows - 1, Math.round((lat - minLat) / latStep)));
        const c = Math.max(0, Math.min(cols - 1, Math.round((lng - minLng) / lngStep)));
        return { r, c };
      };

      const toLatLng = (r, c) => L.latLng(minLat + r * latStep, minLng + c * lngStep);

      const start = toIndex(from.lat, from.lng);
      const goal = toIndex(to.lat, to.lng);

      // 若起點或終點落在阻擋格，嘗試找到附近可用格
      const deltas = [ [0,0],[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1] ];
      const findNearestFree = (idx) => {
        if (!blocked[idx.r][idx.c]) return idx;
        const radiusMax = 5;
        for (let rad = 1; rad <= radiusMax; rad++) {
          for (let dr = -rad; dr <= rad; dr++) {
            for (let dc = -rad; dc <= rad; dc++) {
              const rr = idx.r + dr, cc = idx.c + dc;
              if (rr >= 0 && rr < rows && cc >= 0 && cc < cols && !blocked[rr][cc]) {
                return { r: rr, c: cc };
              }
            }
          }
        }
        return null;
      };

      const s = findNearestFree(start);
      const g = findNearestFree(goal);
      if (!s || !g) return null;

      // A* 搜尋
      const key = (r, c) => `${r},${c}`;
      const open = new Map();
      const cameFrom = new Map();
      const gScore = new Map();
      const fScore = new Map();

      const h = (r, c) => {
        const a = toLatLng(r, c), b = toLatLng(g.r, g.c);
        return approximateDistanceMeters({ lat: a.lat, lng: a.lng }, { lat: b.lat, lng: b.lng });
      };

      const startKey = key(s.r, s.c);
      gScore.set(startKey, 0);
      fScore.set(startKey, h(s.r, s.c));
      open.set(startKey, { r: s.r, c: s.c, f: fScore.get(startKey) });

      const neighbors = (r, c) => {
        const results = [];
        for (const [dr, dc] of deltas) {
          const rr = r + dr, cc = c + dc;
          if (rr < 0 || rr >= rows || cc < 0 || cc >= cols) continue;
          if (blocked[rr][cc]) continue;
          results.push({ r: rr, c: cc });
        }
        return results;
      };

      while (open.size > 0) {
        // 取 f 最小的節點
        let currentKey = null, current = null, bestF = Infinity;
        for (const [k, v] of open.entries()) {
          const f = fScore.get(k) ?? Infinity;
          if (f < bestF) { bestF = f; currentKey = k; current = v; }
        }
        if (!current) break;

        if (current.r === g.r && current.c === g.c) {
          // 回溯路徑
          const path = [];
          let ck = currentKey;
          while (ck) {
            const [rr, cc] = ck.split(',').map(Number);
            path.push(toLatLng(rr, cc));
            ck = cameFrom.get(ck);
          }
          path.reverse();
          // 簡單降採樣，避免太多點
          const simplified = [];
          for (let i = 0; i < path.length; i += 2) simplified.push(path[i]);
          if (simplified[simplified.length - 1] !== path[path.length - 1]) simplified.push(path[path.length - 1]);
          return simplified;
        }

        open.delete(currentKey);
        for (const nb of neighbors(current.r, current.c)) {
          const nk = key(nb.r, nb.c);
          const tentative = (gScore.get(currentKey) ?? Infinity) + approximateDistanceMeters(
            { lat: toLatLng(current.r, current.c).lat, lng: toLatLng(current.r, current.c).lng },
            { lat: toLatLng(nb.r, nb.c).lat, lng: toLatLng(nb.r, nb.c).lng }
          );
          if (tentative < (gScore.get(nk) ?? Infinity)) {
            cameFrom.set(nk, currentKey);
            gScore.set(nk, tentative);
            fScore.set(nk, tentative + h(nb.r, nb.c));
            if (!open.has(nk)) open.set(nk, { r: nb.r, c: nb.c, f: fScore.get(nk) });
          }
        }
      }

      return null;
    } catch {
      return null;
    }
  };

  // 計算最近的疏散點
  const getNearestEvacuationPoint = useCallback((fromLat, fromLng) => {
    const from = L.latLng(fromLat, fromLng);
    let nearest = null;
    let minDist = Infinity;
    evacuationPoints.forEach((pt) => {
      const dist = from.distanceTo(L.latLng(pt.lat, pt.lng));
      if (dist < minDist) {
        minDist = dist;
        nearest = { ...pt, distance: dist };
      }
    });
    return nearest;
  }, []);

  // 取得 OSRM 步行路線（若失敗將回退為直線）
  const fetchOsrmRoute = useCallback(async (from, to) => {
    try {
      const url = `https://router.project-osrm.org/route/v1/foot/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`;
      const response = await fetch(url);
      if (!response.ok) return null;
      const data = await response.json();
      if (!data || !data.routes || !data.routes[0] || !data.routes[0].geometry) return null;
      const coords = data.routes[0].geometry.coordinates; // [lng, lat]
      return coords.map(([lng, lat]) => L.latLng(lat, lng));
    } catch (e) {
      return null;
    }
  }, []);

  // 繪製路徑（優先使用 OSRM，失敗則用直線），並縮放至範圍
  const drawRoute = useCallback(async (fromLat, fromLng, toLat, toLng, distanceM) => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    if (!routeLayerRef.current) {
      routeLayerRef.current = L.layerGroup().addTo(map);
    }
    routeLayerRef.current.clearLayers();

    const from = L.latLng(fromLat, fromLng);
    const to = L.latLng(toLat, toLng);

    // 先嘗試在校園內以格網 A* 規劃避開建物的路線
    let latLngs = computeCampusRouteAvoidingBuildings(from, to, buildings);
    
    // 若沒有找到可行路徑，再嘗試 OSRM 步行路線
    if (!latLngs || latLngs.length < 2) {
      latLngs = await fetchOsrmRoute(from, to);
    }
    if (!latLngs || latLngs.length < 2) {
      latLngs = [from, to];
    }

    const polyline = L.polyline(latLngs, {
      color: '#007bff',
      weight: 4,
      opacity: 0.9,
      dashArray: '6,6'
    }).addTo(routeLayerRef.current);

    // 在終點加上提示距離的 tooltip
    L.marker(to, { opacity: 0 })
      .addTo(routeLayerRef.current)
      .bindTooltip(`距離最近疏散點：約 ${(distanceM/1).toFixed(0)} m`, { permanent: false, direction: 'top' })
      .openTooltip();

    try {
      const bounds = L.latLngBounds(latLngs).pad(0.2);
      map.fitBounds(bounds, { animate: true });
    } catch {}
  }, [fetchOsrmRoute]);

  // 提供給標記彈窗「路線」按鈕的回呼
  const handleRouteRequest = useCallback((hazard) => {
    const nearest = getNearestEvacuationPoint(hazard.lat, hazard.lng);
    if (!nearest) return;
    // 非同步繪製路線（自動選擇 OSRM 或回退）
    drawRoute(hazard.lat, hazard.lng, nearest.lat, nearest.lng, nearest.distance);

    // 嘗試開啟最近疏散點彈窗
    const marker = evacuationMarkersRef.current.get(nearest.id);
    if (marker && marker.openPopup) {
      try { marker.openPopup(); } catch {}
    }
  }, [drawRoute, getNearestEvacuationPoint]);

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
      <ClusterMarkers hazards={hazards} onHazardClick={onHazardClick} onRouteRequest={handleRouteRequest} />

      {/* 疏散點標記與路徑層控制 */}
      <EvacuationAndRouteLayer routeLayerRef={routeLayerRef} evacuationMarkersRef={evacuationMarkersRef} />
      </MapContainer>
    </div>
  );
};

export default MapComponent; 

// 內部輔助元件：渲染疏散點標記並初始化路徑圖層
function EvacuationAndRouteLayer({ routeLayerRef, evacuationMarkersRef }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    // 建立或重設路徑圖層
    if (!routeLayerRef.current) {
      routeLayerRef.current = L.layerGroup().addTo(map);
    } else {
      routeLayerRef.current.clearLayers();
    }

    // 清除舊疏散標記
    evacuationMarkersRef.current.forEach(m => {
      try { if (map.hasLayer(m)) map.removeLayer(m); } catch {}
    });
    evacuationMarkersRef.current.clear();

    // 加入疏散點標記（使用自訂圖示）
    evacuationPoints.forEach(pt => {
      const iconUrl = pt.icon && evacuationIconPaths[pt.icon]
        ? evacuationIconPaths[pt.icon]
        : 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png';
      const marker = L.marker([pt.lat, pt.lng], {
        icon: L.icon({
          iconUrl,
          iconSize: [30, 30],
          iconAnchor: [15, 15]
        })
      }).bindPopup(`<strong>${pt.name || t(`evacuation.points.${pt.id}`)}</strong>`);
      marker.addTo(map);
      evacuationMarkersRef.current.set(pt.id, marker);
    });

  }, [map, routeLayerRef, evacuationMarkersRef]);

  return null;
};