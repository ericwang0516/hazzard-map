/** @type {import('next').NextConfig} */
const nextConfig = {
  // 基本配置
  reactStrictMode: true,
  
  // 修復 Source Map 錯誤
  productionBrowserSourceMaps: false, // 生產環境不生成 Source Map
  
  // 開發環境優化
  experimental: {
    // 優化開發體驗
    optimizePackageImports: ['leaflet', 'react-leaflet'],
  },
  
  // 圖片優化
  images: {
    unoptimized: true, // 對於靜態圖標，不需要優化
  },
};

export default nextConfig;
