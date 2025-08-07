# 多語言功能設定說明

## 功能概述

本專案已整合完整的多語言支援功能，支援繁體中文、英文和日文三種語言。

## 檔案結構

```
locales/
├── zh-TW.json    # 繁體中文語言檔案
├── en.json       # 英文語言檔案
└── ja.json       # 日文語言檔案

contexts/
└── LanguageContext.js    # 語言管理 Context

components/
├── LanguageSwitcher.js           # 語言切換器組件
└── LanguageSwitcher.module.css   # 語言切換器樣式
```

## 使用方法

### 1. 在組件中使用翻譯

```javascript
import { useTranslation } from '../contexts/LanguageContext';

export default function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('header.title')}</h1>
      <p>{t('common.description')}</p>
    </div>
  );
}
```

### 2. 語言切換

語言切換器已自動整合到 header 中，使用者可以：
- 點擊語言切換按鈕
- 從下拉選單中選擇語言
- 語言設定會自動儲存到 localStorage

### 3. 新增翻譯詞條

在語言檔案中新增新的翻譯詞條：

```json
// locales/zh-TW.json
{
  "newSection": {
    "title": "新標題",
    "description": "新描述"
  }
}
```

```json
// locales/en.json
{
  "newSection": {
    "title": "New Title",
    "description": "New Description"
  }
}
```

```json
// locales/ja.json
{
  "newSection": {
    "title": "新しいタイトル",
    "description": "新しい説明"
  }
}
```

### 4. 支援的語言

目前支援的語言：
- `zh-TW`: 繁體中文
- `en`: English
- `ja`: 日本語

### 5. 新增新語言

要新增新語言支援：

1. 在 `locales/` 資料夾中建立新的語言檔案（例如 `ko.json`）
2. 在 `contexts/LanguageContext.js` 中的 `supportedLanguages` 物件新增語言代碼
3. 在 `components/LanguageSwitcher.js` 中的 `getLanguageIcon` 函數新增對應的國旗圖示

## 技術細節

### Context 結構

```javascript
const LanguageContext = {
  currentLanguage: 'zh-TW',           // 當前語言代碼
  translations: {},                   // 當前語言的翻譯物件
  changeLanguage: (code) => {},       // 切換語言函數
  supportedLanguages: {}              // 支援的語言列表
}
```

### 翻譯函數

`t(key)` 函數支援巢狀物件存取：
- `t('header.title')` → 存取 `translations.header.title`
- `t('common.loading')` → 存取 `translations.common.loading`

### 自動儲存

語言設定會自動儲存到瀏覽器的 localStorage 中，下次訪問時會自動載入上次選擇的語言。

## 注意事項

1. 所有語言檔案必須包含相同的鍵值結構
2. 翻譯函數會回傳原始鍵值如果找不到對應翻譯
3. 語言切換是即時的，不需要重新載入頁面
4. 支援響應式設計，在手機上語言切換器會自動調整樣式 