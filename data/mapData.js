// Map Data

export const campusBounds = {
  name: 'NTUT',
  bounds: [
    // Coordinates
    [25.04198, 121.53670],
    [25.04417, 121.53306]
  ],
  style: {
    color: '#0066cc',
    weight: 2,
    fillColor: '#0066cc',
    fillOpacity: 0.1
  }
};

export const buildings = [
  {
    id: 1,
    name: 'General Building',
    lat: 25.0427,
    lng: 121.5359,
    description: 'General Building',
    type: 'academic'
  },
  {
    id: 2,
    name: 'Engineering Building',
    lat: 25.0438,  // 25.043840133750635, 121.53477032858697
    lng: 121.5347,
    description: 'Engineering Building',
    type: 'academic'
  },
  {
    id: 3,
    name: 'Design Building',
    lat: 25.042540, // 25.042540552842755, 121.53378760091171
    lng: 121.5337,
    description: 'Design Building',
    type: 'academic'
  },
  {
    id: 4,
    name: 'Chemical Engineering Building',
    lat: 25.0438, // 25.043823811978076, 121.53440325709717
    lng: 121.5344,
    description: 'Chemical Engineering Building',
    type: 'facility'
  },
];

// 危險區域資料
export const hazardData = [
  {
    id: 1,
    name: 'Chemical Lab A',
    type: 'chemical',
    level: 'high',
    lat: 25.0427,
    lng: 121.5359,
    description: 'Chemical Lab',
    building: 'General Building'
  },
  {
    id: 2,
    name: 'Mechanical Factory',
    type: 'mechanical',
    level: 'medium',
    lat: 25.0438,
    lng: 121.5347,
    description: 'Mechanical Factory',
    building: 'Engineering Building'
  },
  {
    id: 3,
    name: 'Electrical Equipment Room',
    type: 'electrical',
    level: 'low',
    lat: 25.042540,
    lng: 121.5337,
    description: 'Electrical Equipment Room',
    building: 'Design Building'
  },
  {
    id: 4,
    name: 'Storage Warehouse',
    type: 'storage',
    level: 'high',
    lat: 25.0438,
    lng: 121.5344,
    description: 'Storage Warehouse',
    building: 'Chemical Engineering Building'
  },
  {
    id: 5,
    name: 'Chemical Lab B',
    type: 'chemical',
    level: 'medium',
    lat: 25.0427,
    lng: 121.5359,
    description: 'Chemical Lab B',
    building: 'General Building'
  }
];

// 圖片路徑配置
export const iconPaths = {
  chemical: {
    high: '/icons/chemical_high.png',    
    medium: '/icons/chemical_med.png',   
    low: '/icons/chemical_low.png'       
  },
  mechanical: {
    high: '/icons/mechanical_high.png',  
    medium: '/icons/mechanical_med.png', 
    low: '/icons/mechanical_low.png'     
  },
  electrical: {
    high: '/icons/electrical_high.png',  
    medium: '/icons/electrical_med.png', 
    low: '/icons/electrical_low.png'     
  },
  storage: {
    high: '/icons/storage_high.png',     
    medium: '/icons/storage_med.png',    
    low: '/icons/storage_low.png'        
  }
};

// 根據危險類型和等級獲取圖示
export const getHazardIcon = (type, level) => {
  if (iconPaths[type] && typeof iconPaths[type] === 'object' && iconPaths[type][level]) {
    return iconPaths[type][level];
  }
  
  if (iconPaths[type] && typeof iconPaths[type] === 'string') {
    return iconPaths[type];
  }
  
  return iconPaths.chemical.medium;
};

// 檢查某個危險類型是否有等級化圖示
export const hasLeveledIcons = (type) => {
  return iconPaths[type] && typeof iconPaths[type] === 'object';
};

// 獲取某個危險類型的所有等級圖示
export const getTypeIcons = (type) => {
  if (hasLeveledIcons(type)) {
    return iconPaths[type];
  }
  return null;
};

// 危險類型定義
export const hazardTypes = {
  chemical: {
    name: 'Chemical Hazard',
    color: '#ff4444',
    icon: iconPaths.chemical.medium, // 預設使用中危險圖示
    description: 'Chemical Hazard'
  },
  mechanical: {
    name: 'Mechanical Hazard',
    color: '#ff8800',
    icon: iconPaths.mechanical.medium, // 預設使用中危險圖示
    description: 'Mechanical Hazard'
  },
  electrical: {
    name: 'Electrical Hazard',
    color: '#ffcc00',
    icon: iconPaths.electrical.medium, // 預設使用中危險圖示
    description: 'Electrical Hazard'
  },
  storage: {
    name: 'Storage Hazard',
    color: '#ff0066',
    icon: iconPaths.storage.medium, // 預設使用中危險圖示
    description: 'Storage Hazard'
  }
};

// 危險等級定義
export const hazardLevels = {
  high: {
    name: 'High Risk',
    color: '#dc3545',
    size: 20,
    description: 'High Risk Zone',
    displayText: 'HIGH',
    radarRadius: 50 // 雷達動畫範圍（公尺）
  },
  medium: {
    name: 'Medium Risk',
    color: '#fd7e14',
    size: 16,
    description: 'Medium Risk Zone',
    displayText: 'MEDIUM',
    radarRadius: 25 // 雷達動畫範圍（公尺）
  },
  low: {
    name: 'Low Risk',
    color: '#28a745',
    size: 12,
    description: 'Low Risk Zone',
    displayText: 'LOW',
    radarRadius: 20 // 雷達動畫範圍（公尺）
  }
};

// 圖例資料
export const legendData = {
  hazardTypes: [
    { key: 'chemical', name: 'Chemical Hazard', color: '#ff4444', icon: iconPaths.chemical.medium },
    { key: 'mechanical', name: 'Mechanical Hazard', color: '#ff8800', icon: iconPaths.mechanical.medium },
    { key: 'electrical', name: 'Electrical Hazard', color: '#ffcc00', icon: iconPaths.electrical.medium },
    { key: 'storage', name: 'Storage Hazard', color: '#ff0066', icon: iconPaths.storage.medium }
  ],
  hazardLevels: [
    { key: 'high', name: 'High Risk', color: '#dc3545' },
    { key: 'medium', name: 'Medium Risk', color: '#fd7e14' },
    { key: 'low', name: 'Low Risk', color: '#28a745' }
  ]
};

// 地圖中心點和縮放等級
export const mapConfig = {
  center: [25.0430, 121.5348], // 地圖中心點 - 調整為建築物群的中心
  zoom: 17, // 縮放等級
  minZoom: 15,
  maxZoom: 19
}; 