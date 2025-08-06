# 危險圖示設定說明

## 檔案命名規則

所有危險圖示都遵循以下命名規則：
```
{危險類型}_{危險等級}.png
```

### 支援的危險類型
- `chemical` - 化學危險
- `mechanical` - 機械危險  
- `electrical` - 電氣危險
- `storage` - 儲存危險

### 支援的危險等級
- `high` - 高危險
- `med` - 中危險
- `low` - 低危險

## 檔案結構

將您的圖示檔案放在以下位置：
```
public/icons/
├── chemical_high.png
├── chemical_med.png
├── chemical_low.png
├── mechanical_high.png
├── mechanical_med.png
├── mechanical_low.png
├── electrical_high.png
├── electrical_med.png
├── electrical_low.png
├── storage_high.png
├── storage_med.png
└── storage_low.png
```

## 功能說明

### 自動圖示選擇
系統會根據危險區域的類型和等級自動選擇對應的圖示：
- 化學高危險 → `chemical_high.png`
- 機械中危險 → `mechanical_med.png`
- 電氣低危險 → `electrical_low.png`

### 圖例顯示
- 有等級化圖示的危險類型會在圖例中顯示三個等級的圖示
- 沒有等級化圖示的危險類型會顯示單一圖示

### 向後相容
- 如果某個危險類型缺少等級化圖示，系統會自動使用預設圖示
- 支援混合使用等級化和非等級化圖示

## 添加新的危險類型

1. 在 `data/mapData.js` 的 `iconPaths` 中添加新類型：
```javascript
newType: {
  high: '/icons/newtype_high.png',
  medium: '/icons/newtype_med.png', 
  low: '/icons/newtype_low.png'
}
```

2. 在 `hazardTypes` 中添加新類型定義
3. 在 `legendData.hazardTypes` 中添加新類型
4. 將對應的圖示檔案放入 `public/icons/` 資料夾

## 圖示規格建議

- 格式：PNG（推薦）或 SVG
- 尺寸：建議 24x24 像素或更大
- 背景：透明背景
- 顏色：與危險類型顏色協調
- 風格：保持一致的視覺風格 