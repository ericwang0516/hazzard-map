'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { useMap } from 'react-leaflet';
import { getClusterSize, getClusterColor } from '../utils/clusterUtils';

// 創建聚合標記的圖標
const createClusterIcon = (count) => {
  const size = getClusterSize(count);
  const color = getClusterColor(count);
  
  // 創建 SVG 圖標
  const svg = `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 2}" fill="${color}" stroke="white" stroke-width="2"/>
      <text x="${size/2}" y="${size/2 + 4}" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="${Math.max(10, size/3)}" font-weight="bold">${count}</text>
    </svg>
  `.trim();
  
  // 將 SVG 轉換為 data URL
  const dataUrl = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
  
  return L.icon({
    iconUrl: dataUrl,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
    className: 'cluster-marker'
  });
};

const ClusterMarker = ({ cluster, onClusterClick }) => {
  const map = useMap();
  const markerRef = useRef(null);

  useEffect(() => {
    if (!cluster || !map) return;

    let marker = null;
    
    try {
      const icon = createClusterIcon(cluster.count);
      
      marker = L.marker([cluster.center.lat, cluster.center.lng], {
        icon: icon
      });

      // 添加點擊事件
      if (onClusterClick) {
        marker.on('click', () => {
          onClusterClick(cluster);
        });
      }

      // 添加彈出視窗
      const popupContent = `
        <div class="cluster-popup">
          <h3 style="margin: 0 0 8px 0; color: #333;">聚合區域</h3>
          <p style="margin: 0; color: #666;">包含 ${cluster.count} 個危險項目</p>
          <div style="margin-top: 8px; font-size: 0.9rem; color: #888;">
            <strong>危險項目列表:</strong>
            <ul style="margin: 4px 0; padding-left: 16px;">
              ${cluster.hazards.map(hazard => `
                <li>${hazard.name} (${hazard.type})</li>
              `).join('')}
            </ul>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);

      // 將標記添加到地圖
      if (map && map.hasLayer) {
        marker.addTo(map);
        markerRef.current = marker;
      }
    } catch (error) {
      console.warn('創建聚合標記時發生錯誤:', error);
    }

    return () => {
      try {
        if (markerRef.current && map && map.hasLayer) {
          if (map.hasLayer(markerRef.current)) {
            map.removeLayer(markerRef.current);
          }
          markerRef.current = null;
        }
      } catch (error) {
        console.warn('清理聚合標記時發生錯誤:', error);
      }
    };
  }, [cluster, onClusterClick, map]);

  return null; // 這個組件不渲染任何 DOM 元素
};

export default ClusterMarker; 