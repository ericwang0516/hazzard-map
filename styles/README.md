# CSS 結構說明

這個目錄包含了專案的所有樣式檔案，採用模組化的方式組織以便於管理。

## 檔案結構

```
styles/
├── globals.css                    # 全域樣式設定
├── components/                    # 組件樣式模組
│   ├── layout.module.css         # 佈局相關樣式
│   ├── map.module.css            # 地圖組件樣式
│   ├── ui.module.css             # UI 組件樣式（篩選器、列表、圖例等）
│   └── language-switcher.module.css # 語言切換器樣式
└── README.md                     # 本說明文件
```

## 檔案說明

### `globals.css`
- CSS 變數定義（顏色、字體等）
- 全域重置樣式
- 基礎排版設定
- 滾動條自定義
- 響應式基礎設定

### `components/layout.module.css`
- 主要容器樣式
- 標題列樣式
- 主要內容區域樣式
- 側邊欄佈局
- 動畫效果定義

### `components/map.module.css`
- 地圖容器樣式
- Leaflet 地圖自定義樣式
- 地圖控制項樣式
- 彈出視窗樣式
- 地圖載入狀態樣式

### `components/ui.module.css`
- 篩選器組件樣式
- 危險區域列表樣式
- 圖例組件樣式
- 危險等級標籤樣式
- 圖示樣式

### `components/language-switcher.module.css`
- 語言切換器容器樣式
- 下拉選單樣式
- 語言選項樣式
- 動畫效果

## 使用方式

在組件中引入樣式模組：

```javascript
import styles from '../styles/components/layout.module.css';
import uiStyles from '../styles/components/ui.module.css';
import mapStyles from '../styles/components/map.module.css';
```

## 設計原則

1. **模組化**：每個組件都有獨立的 CSS 模組
2. **可維護性**：樣式按功能分類，易於找到和修改
3. **一致性**：使用 CSS 變數確保設計一致性
4. **響應式**：所有組件都支援響應式設計
5. **效能**：避免全域樣式污染，使用 CSS Modules

## 修改指南

- 全域樣式修改：編輯 `globals.css`
- 組件樣式修改：編輯對應的 `.module.css` 檔案
- 新增組件樣式：在 `components/` 目錄下創建新的 `.module.css` 檔案 