# 聚合功能配置說明

## 如何調整縮放等級閾值

要調整聚合功能的縮放等級閾值，請編輯 `utils/clusterUtils.js` 文件中的 `CLUSTER_CONFIG` 物件。

### 當前配置
```javascript
export const CLUSTER_CONFIG = {
  // 縮放等級閾值：當縮放等級 >= 此值時，顯示個別標記；< 此值時，顯示聚合標記
  ZOOM_THRESHOLD: 18,
  
  // 聚合距離閾值（公尺）：在此距離內的標記會被聚合
  CLUSTER_RADIUS: 50,
  
  // 是否啟用聚合功能
  ENABLED: true
};
```

### 聚合標記設定
```javascript
// 圓圈大小設定
export const getClusterSize = (count) => {
  if (count >= 10) return 50;  // 10個以上：50px
  if (count >= 5) return 45;   // 5-9個：45px
  if (count >= 3) return 40;   // 3-4個：40px
  return 35;                   // 1-2個：35px
};

// 圓圈顏色設定
export const getClusterColor = (count) => {
  if (count >= 10) return '#dc3545'; // 紅色 - 高密度
  if (count >= 5) return '#fd7e14';  // 橙色 - 中密度
  if (count >= 3) return '#ffc107';  // 黃色 - 中密度
  return '#ffc107';                  // 黃色 - 單個
};
```

### 調整選項

#### 1. 縮放等級閾值 (ZOOM_THRESHOLD)
- **數值範圍**：0-20（Leaflet 地圖的縮放等級範圍）
- **當前設定**：17
- **效果**：
  - 縮放等級 >= 17：顯示所有個別標記
  - 縮放等級 < 17：顯示聚合標記

#### 2. 聚合距離閾值 (CLUSTER_RADIUS)
- **數值範圍**：任意正數（公尺）
- **當前設定**：50
- **效果**：在此距離內的標記會被聚合為一個圓圈

#### 3. 啟用/禁用聚合功能 (ENABLED)
- **數值範圍**：true/false
- **當前設定**：true
- **效果**：
  - true：啟用聚合功能
  - false：禁用聚合功能，始終顯示個別標記

### 常見調整範例

#### 範例 1：更早開始聚合（縮放等級 18 時就聚合）
```javascript
export const CLUSTER_CONFIG = {
  ZOOM_THRESHOLD: 18,  // 改為 18
  CLUSTER_RADIUS: 50,
  ENABLED: true
};
```

#### 範例 2：更晚開始聚合（縮放等級 16 時才聚合）
```javascript
export const CLUSTER_CONFIG = {
  ZOOM_THRESHOLD: 16,  // 改為 16
  CLUSTER_RADIUS: 50,
  ENABLED: true
};
```

#### 範例 3：更大的聚合範圍（100 公尺）
```javascript
export const CLUSTER_CONFIG = {
  ZOOM_THRESHOLD: 17,
  CLUSTER_RADIUS: 100,  // 改為 100
  ENABLED: true
};
```

#### 範例 4：完全禁用聚合功能
```javascript
export const CLUSTER_CONFIG = {
  ZOOM_THRESHOLD: 17,
  CLUSTER_RADIUS: 50,
  ENABLED: false  // 改為 false
};
```

### 縮放等級參考
- **0-10**：世界/國家級視圖
- **11-13**：城市級視圖
- **14-16**：區域級視圖
- **17-19**：街道級視圖
- **20**：建築物級視圖

### 建議設定
- **校園地圖**：建議使用 16-18 之間的閾值
- **城市地圖**：建議使用 14-16 之間的閾值
- **區域地圖**：建議使用 12-14 之間的閾值

### 修改後的效果
修改配置後，聚合功能會立即生效，無需重啟應用程式。您可以：
1. 縮放地圖來測試新的閾值設定
2. 觀察標記何時開始聚合
3. 根據實際使用體驗調整設定 