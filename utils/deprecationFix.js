/**
 * 修復棄用警告的工具函數
 * 處理 MouseEvent.mozPressure 和 MouseEvent.mozInputSource 的棄用警告
 */

// 抑制瀏覽器控制台中的棄用警告
export const suppressDeprecationWarnings = () => {
  if (typeof window !== 'undefined' && typeof console !== 'undefined') {
    // 保存原始的 console.warn 方法
    const originalWarn = console.warn;
    
    // 覆蓋 console.warn 來過濾棄用警告
    console.warn = function(...args) {
      const message = args.join(' ');
      
      // 過濾掉特定的棄用警告
      if (
        message.includes('MouseEvent.mozPressure') ||
        message.includes('MouseEvent.mozInputSource') ||
        message.includes('已棄用 MouseEvent.mozPressure') ||
        message.includes('已棄用 MouseEvent.mozInputSource') ||
        message.includes("'get mozPressure' called on an object that does not implement interface MouseEvent") ||
        message.includes('mozPressure') ||
        message.includes('mozInputSource') ||
        message.includes('DeprecationWarning')
      ) {
        // 不顯示這些警告
        return;
      }
      
      // 顯示其他警告
      originalWarn.apply(console, args);
    };
    
    // 也抑制 console.error 中的相關錯誤
    const originalError = console.error;
    console.error = function(...args) {
      const message = args.join(' ');
      
      // 過濾掉相關的錯誤
      if (
        message.includes('MouseEvent.mozPressure') ||
        message.includes('MouseEvent.mozInputSource') ||
        message.includes('mozPressure') ||
        message.includes('mozInputSource') ||
        message.includes("'get mozPressure' called on an object that does not implement interface MouseEvent")
      ) {
        // 不顯示這些錯誤
        return;
      }
      
      // 顯示其他錯誤
      originalError.apply(console, args);
    };
  }
};

// 初始化修復
export const initDeprecationFixes = () => {
  suppressDeprecationWarnings();
  
  // 在 DOM 載入完成後再次執行修復
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        suppressDeprecationWarnings();
      });
    } else {
      suppressDeprecationWarnings();
    }
  }
};

// 自動執行修復
if (typeof window !== 'undefined') {
  initDeprecationFixes();
} 