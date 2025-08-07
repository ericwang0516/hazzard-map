// 地圖標記聚合工具

// 聚合配置
export const CLUSTER_CONFIG = {
  // 縮放等級閾值：當縮放等級 >= 此值時，顯示個別標記；< 此值時，顯示聚合標記
  // 調整這個數值來改變聚合開始的縮放等級
  ZOOM_THRESHOLD: 17, // 改為 16，表示縮放等級 < 16 時顯示聚合標記
  
  // 聚合距離閾值（公尺）：在此距離內的標記會被聚合
  CLUSTER_RADIUS: 50,
  
  // 是否啟用聚合功能
  ENABLED: true
};

// 計算兩個座標點之間的距離（公尺）
export const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371e3; // 地球半徑（公尺）
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lng2 - lng1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

// 聚合危險項目
export const clusterHazards = (hazards, zoomLevel, clusterRadius = CLUSTER_CONFIG.CLUSTER_RADIUS) => {
  // 如果聚合功能被禁用，直接返回個別標記
  if (!CLUSTER_CONFIG.ENABLED) {
    return hazards.map(hazard => ({
      type: 'individual',
      hazards: [hazard],
      center: { lat: hazard.lat, lng: hazard.lng },
      count: 1
    }));
  }
  
  if (zoomLevel >= CLUSTER_CONFIG.ZOOM_THRESHOLD) {
    // 縮放等級較大時，顯示所有個別標記
    return hazards.map(hazard => ({
      type: 'individual',
      hazards: [hazard],
      center: { lat: hazard.lat, lng: hazard.lng },
      count: 1
    }));
  }

  const clusters = [];
  const processed = new Set();

  hazards.forEach((hazard, index) => {
    if (processed.has(index)) return;

    const cluster = {
      type: 'cluster',
      hazards: [hazard],
      center: { lat: hazard.lat, lng: hazard.lng },
      count: 1
    };

    processed.add(index);

    // 尋找附近的危險項目
    hazards.forEach((otherHazard, otherIndex) => {
      if (otherIndex === index || processed.has(otherIndex)) return;

      const distance = calculateDistance(
        hazard.lat, hazard.lng,
        otherHazard.lat, otherHazard.lng
      );

      if (distance <= clusterRadius) {
        cluster.hazards.push(otherHazard);
        cluster.count++;
        processed.add(otherIndex);
      }
    });

    // 計算聚合中心點
    if (cluster.count > 1) {
      const totalLat = cluster.hazards.reduce((sum, h) => sum + h.lat, 0);
      const totalLng = cluster.hazards.reduce((sum, h) => sum + h.lng, 0);
      cluster.center = {
        lat: totalLat / cluster.count,
        lng: totalLng / cluster.count
      };
    }

    clusters.push(cluster);
  });

  return clusters;
};

// 根據聚合數量決定圓圈大小
export const getClusterSize = (count) => {
  if (count >= 10) return 50;  // 增加大小
  if (count >= 5) return 45;   // 增加大小
  if (count >= 3) return 40;   // 增加大小
  return 35;                   // 增加大小，從黃色開始
};

// 根據聚合數量決定圓圈顏色
export const getClusterColor = (count) => {
  if (count >= 10) return '#dc3545'; // 紅色 - 高密度
  if (count >= 5) return '#fd7e14';  // 橙色 - 中密度
  if (count >= 3) return '#ffc107';  // 黃色 - 中密度
  return '#ffc107';                  // 黃色 - 單個，從黃色開始
}; 