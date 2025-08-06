// 地圖資料庫 - 可手動加入和修改標示位置

// 大學範圍線資料
export const campusBounds = {
  name: '國立台北科技大學',
  bounds: [
    [25.04198, 121.53670], // 西南角
    [25.04417, 121.53306]  // 東北角
  ],
  style: {
    color: '#0066cc',
    weight: 2,
    fillColor: '#0066cc',
    fillOpacity: 0.1
  }
};

// 建築物標記資料
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

// 危險類型定義
export const hazardTypes = {
  chemical: {
    name: 'Chemical Hazard',
    color: '#ff4444',
    icon: '🧪',
    description: '化學品相關危險'
  },
  mechanical: {
    name: 'Mechanical Hazard',
    color: '#ff8800',
    icon: '⚙️',
    description: '機械設備相關危險'
  },
  electrical: {
    name: 'Electrical Hazard',
    color: '#ffcc00',
    icon: '⚡',
    description: '電氣設備相關危險'
  },
  storage: {
    name: 'Storage Hazard',
    color: '#ff0066',
    icon: '📦',
    description: '儲存物品相關危險'
  }
};

// 危險等級定義
export const hazardLevels = {
  high: {
    name: 'High Risk',
    color: '#dc3545',
    size: 20,
    description: '需要立即注意的高危險區域',
    displayText: '高',
    radarRadius: 50 // 雷達動畫範圍（公尺）
  },
  medium: {
    name: 'Medium Risk',
    color: '#fd7e14',
    size: 16,
    description: '需要定期檢查的中危險區域',
    displayText: '中',
    radarRadius: 25 // 雷達動畫範圍（公尺）
  },
  low: {
    name: 'Low Risk',
    color: '#28a745',
    size: 12,
    description: '需要一般注意的低危險區域',
    displayText: '低',
    radarRadius: 20 // 雷達動畫範圍（公尺）
  }
};

// 圖例資料
export const legendData = {
  hazardTypes: [
    { key: 'chemical', name: 'Chemical Hazard', color: '#ff4444', icon: '🧪' },
    { key: 'mechanical', name: 'Mechanical Hazard', color: '#ff8800', icon: '⚙️' },
    { key: 'electrical', name: 'Electrical Hazard', color: '#ffcc00', icon: '⚡' },
    { key: 'storage', name: 'Storage Hazard', color: '#ff0066', icon: '📦' }
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