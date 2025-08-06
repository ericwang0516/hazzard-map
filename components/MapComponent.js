'use client';

import { useEffect, useRef, useState } from 'react';
import { 
  campusBounds, 
  buildings, 
  hazardData, 
  hazardTypes, 
  hazardLevels, 
  mapConfig 
} from '../data/mapData';

export default function MapComponent({ hazards = [] }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState(null);

  // 初始化地圖
  useEffect(() => {
    const loadMap = async () => {
      try {
        const L = await import('leaflet');
        
        // 修復 Leaflet 圖示問題
        delete L.default.Icon.Default.prototype._getIconUrl;
        L.default.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        });

        if (!mapRef.current || mapInstanceRef.current) return;

        console.log('初始化地圖...');
        console.log('地圖容器尺寸:', mapRef.current.offsetWidth, 'x', mapRef.current.offsetHeight);
        
        // 等待容器有正確的尺寸
        let retryCount = 0;
        const maxRetries = 50; // 最多等待5秒
        
        const waitForContainer = () => {
          if (mapRef.current.offsetWidth > 0 && mapRef.current.offsetHeight > 0) {
            console.log('容器尺寸正確，開始初始化地圖');
            console.log('最終容器尺寸:', mapRef.current.offsetWidth, 'x', mapRef.current.offsetHeight);
            
            try {
              // 使用資料庫中的地圖配置
              const map = L.default.map(mapRef.current).setView(mapConfig.center, mapConfig.zoom);
              
              if (!map) {
                throw new Error('地圖初始化失敗');
              }
              
              mapInstanceRef.current = map;
              console.log('地圖對象創建成功:', map);
            
              // 添加地圖圖層
              const tileLayer = L.default.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
                attribution: '© NTUT-Hazzard Map built on OpenStreetMap',
                subdomains: 'abcd',
                maxZoom: mapConfig.maxZoom
              });
              
              if (tileLayer) {
                tileLayer.addTo(map);
                console.log('地圖圖層添加成功');
              }

              // 使用資料庫中的校園邊界
              const rectangle = L.default.rectangle(campusBounds.bounds, campusBounds.style);
              
              if (rectangle) {
                rectangle.addTo(map).bindPopup(campusBounds.name);
                console.log('校園邊界添加成功');
              }

              // 使用資料庫中的建築物標記
              buildings.forEach((building, index) => {
                const marker = L.default.marker([building.lat, building.lng]);
                if (marker) {
                  const popupContent = `
                    <div style="text-align: center;">
                      <h4 style="margin: 0 0 8px 0; color: #333;">${building.name}</h4>
                      <p style="margin: 4px 0; color: #666;">${building.description}</p>
                      <p style="margin: 4px 0; color: #888; font-size: 0.9rem;">類型: ${building.type === 'academic' ? '學術建築' : '設施建築'}</p>
                    </div>
                  `;
                  marker.addTo(map).bindPopup(popupContent);
                  console.log(`建築物標記 ${index + 1} 添加成功:`, building.name);
                }
              });

              setMapLoaded(true);
              console.log('地圖初始化完成');
              
              // 強制重新計算地圖大小
              setTimeout(() => {
                if (map && map.invalidateSize) {
                  map.invalidateSize();
                  console.log('地圖大小已重新計算');
                }
              }, 100);
              
            } catch (mapError) {
              console.error('地圖初始化錯誤:', mapError);
              setError(mapError.message);
            }
            
          } else {
            retryCount++;
            console.log(`容器尺寸為0，等待... (${retryCount}/${maxRetries})`, mapRef.current.offsetWidth, 'x', mapRef.current.offsetHeight);
            
            if (retryCount >= maxRetries) {
              console.error('等待容器尺寸超時，強制初始化地圖');
              // 強制設置容器尺寸
              mapRef.current.style.width = '100%';
              mapRef.current.style.height = '300px';
              
              try {
                // 使用資料庫中的地圖配置
                const map = L.default.map(mapRef.current).setView(mapConfig.center, mapConfig.zoom);
                
                if (!map) {
                  throw new Error('強制初始化地圖失敗');
                }
                
                mapInstanceRef.current = map;
                console.log('強制初始化地圖對象創建成功:', map);
              
                // 添加地圖圖層
                const tileLayer = L.default.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
                  attribution: '© NTUT-Hazzard Map built on OpenStreetMap',
                  subdomains: 'ntut-map',
                  maxZoom: mapConfig.maxZoom
                });
                
                if (tileLayer) {
                  tileLayer.addTo(map);
                  console.log('強制初始化地圖圖層添加成功');
                }

                // 使用資料庫中的校園邊界
                const rectangle = L.default.rectangle(campusBounds.bounds, campusBounds.style);
                
                if (rectangle) {
                  rectangle.addTo(map).bindPopup(campusBounds.name);
                  console.log('強制初始化校園邊界添加成功');
                }

                // 使用資料庫中的建築物標記
                buildings.forEach((building, index) => {
                  const marker = L.default.marker([building.lat, building.lng]);
                  if (marker) {
                    const popupContent = `
                      <div style="text-align: center;">
                        <h4 style="margin: 0 0 8px 0; color: #333;">${building.name}</h4>
                        <p style="margin: 4px 0; color: #666;">${building.description}</p>
                        <p style="margin: 4px 0; color: #888; font-size: 0.9rem;">類型: ${building.type === 'academic' ? '學術建築' : '設施建築'}</p>
                      </div>
                    `;
                    marker.addTo(map).bindPopup(popupContent);
                    console.log(`強制初始化建築物標記 ${index + 1} 添加成功:`, building.name);
                  }
                });

                setMapLoaded(true);
                console.log('地圖強制初始化完成');
                
                // 強制重新計算地圖大小
                setTimeout(() => {
                  if (map && map.invalidateSize) {
                    map.invalidateSize();
                    console.log('地圖大小已重新計算');
                  }
                }, 100);
                
              } catch (forceMapError) {
                console.error('強制初始化地圖錯誤:', forceMapError);
                setError(forceMapError.message);
              }
            } else {
              setTimeout(waitForContainer, 100);
            }
          }
        };
        
        waitForContainer();

      } catch (err) {
        console.error('地圖載入錯誤:', err);
        setError(err.message);
      }
    };

    loadMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // 監聽視窗大小變化
  useEffect(() => {
    const handleResize = () => {
      if (mapInstanceRef.current && mapInstanceRef.current.invalidateSize) {
        setTimeout(() => {
          if (mapInstanceRef.current && mapInstanceRef.current.invalidateSize) {
            mapInstanceRef.current.invalidateSize();
            console.log('視窗大小變化，地圖已更新');
          }
        }, 100);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mapLoaded]);

  // 更新危險區域標記
  useEffect(() => {
    if (!mapInstanceRef.current || !mapLoaded) return;

    const updateHazards = async () => {
      try {
        const L = await import('leaflet');
        
        // 檢查地圖實例是否有效
        if (!mapInstanceRef.current || !mapInstanceRef.current.eachLayer) {
          console.log('地圖實例無效，跳過更新危險區域');
          return;
        }
        
        // 清除現有危險標記
        mapInstanceRef.current.eachLayer(layer => {
          if (layer._hazardMarker) {
            mapInstanceRef.current.removeLayer(layer);
          }
        });

        // 使用資料庫中的危險區域資料
        const hazardsToShow = hazards.length > 0 ? hazards : hazardData;
        
        hazardsToShow.forEach(hazard => {
          const hazardType = hazardTypes[hazard.type];
          const hazardLevel = hazardLevels[hazard.level];

          // 創建危險標記
          const icon = L.default.divIcon({
            className: 'hazard-marker',
            html: `<div style="
              width: ${hazardLevel.size}px; 
              height: ${hazardLevel.size}px; 
              background-color: ${hazardType.color}; 
              border: 2px solid white; 
              border-radius: 50%; 
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            "></div>`,
            iconSize: [hazardLevel.size, hazardLevel.size],
            iconAnchor: [hazardLevel.size/2, hazardLevel.size/2]
          });

          const marker = L.default.marker([hazard.lat, hazard.lng], { icon }).addTo(mapInstanceRef.current);
          marker._hazardMarker = true;

          // 創建雷達動畫圓圈
          const radarCircle = L.default.circle([hazard.lat, hazard.lng], {
            radius: hazardLevel.radarRadius,
            color: hazardType.color,
            fillColor: hazardType.color,
            fillOpacity: 0.08,
            weight: 1.5,
            opacity: 0.4
          }).addTo(mapInstanceRef.current);
          
          radarCircle._hazardMarker = true;

          // 創建向外擴散的小圈
          const expandingCircle = L.default.circle([hazard.lat, hazard.lng], {
            radius: 3,
            color: hazardType.color,
            fillColor: hazardType.color,
            fillOpacity: 0.4,
            weight: 2,
            opacity: 1
          }).addTo(mapInstanceRef.current);
          
          expandingCircle._hazardMarker = true;

          // 添加向外擴散動畫效果
          let animationStep = 0;
          const animateRadar = () => {
            // 計算擴散圈的位置和大小
            const progress = (animationStep % 80) / 80; // 0 到 1 的循環，80幀一個週期
            const currentRadius = 3 + (hazardLevel.radarRadius - 3) * progress;
            
            // 使用緩動函數讓動畫更自然
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const currentOpacity = 1 * (1 - easeOut);
            const currentFillOpacity = 0.4 * (1 - easeOut);
            
            expandingCircle.setRadius(currentRadius);
            expandingCircle.setStyle({
              opacity: currentOpacity,
              fillOpacity: currentFillOpacity
            });
            
            animationStep++;
            requestAnimationFrame(animateRadar);
          };
          
          animateRadar();

          const popupContent = `
            <div style="text-align: center;">
              <h4 style="margin: 0 0 8px 0; color: #333;">${hazard.name}</h4>
              <p style="margin: 4px 0; color: #666;">類型: ${hazardType.name}</p>
              <p style="margin: 4px 0; color: #666;">等級: ${hazardLevel.name}</p>
              <p style="margin: 4px 0; color: #666;">建築: ${hazard.building || '未指定'}</p>
              <p style="margin: 4px 0; color: #888; font-size: 0.9rem;">${hazard.description || ''}</p>
              <p style="margin: 4px 0; color: #666;">影響範圍: ${hazardLevel.radarRadius}公尺</p>
            </div>
          `;

          marker.bindPopup(popupContent);
        });

      } catch (err) {
        console.error('更新危險區域錯誤:', err);
      }
    };

    updateHazards();
  }, [hazards, mapLoaded]);

  if (error) {
    return (
      <div className="map-error">
        地圖載入失敗: {error}
      </div>
    );
  }

  return (
    <div 
      ref={mapRef} 
      className="map-container"
      style={{
        width: '100%',
        height: '100%',
        minHeight: '100px',
        minWidth: '300px'
      }}
    >
      {!mapLoaded && (
        <div className="map-loading">
          載入地圖中...
        </div>
      )}
    </div>
  );
} 