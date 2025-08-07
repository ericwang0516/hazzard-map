import { useState, useCallback, useMemo } from 'react';
import { hazardData, hazardTypes } from '../data/mapData';

/**
 * 自定義 Hook：管理地圖狀態
 * 善用 React 的狀態管理和記憶化優勢
 */
export const useMapState = () => {
  // 基本狀態
  const [selectedHazard, setSelectedHazard] = useState('all');
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [isZooming, setIsZooming] = useState(false);

  // 使用 useMemo 優化過濾邏輯
  const filteredHazards = useMemo(() => {
    console.log('篩選邏輯執行，selectedHazard:', selectedHazard);
    console.log('原始危險資料數量:', hazardData.length);
    
    if (selectedHazard === 'all') {
      console.log('選擇所有類型，返回所有危險項目');
      return hazardData;
    }
    
    const filtered = hazardData.filter(hazard => hazard.type === selectedHazard);
    console.log(`篩選類型 ${selectedHazard}，結果數量:`, filtered.length);
    return filtered;
  }, [selectedHazard]);

  // 使用 useMemo 優化危險類型統計
  const hazardStats = useMemo(() => {
    const stats = {
      total: hazardData.length,
      byType: {},
      byLevel: { high: 0, medium: 0, low: 0 }
    };

    hazardData.forEach(hazard => {
      // 按類型統計
      if (!stats.byType[hazard.type]) {
        stats.byType[hazard.type] = 0;
      }
      stats.byType[hazard.type]++;

      // 按等級統計
      stats.byLevel[hazard.level]++;
    });

    return stats;
  }, []);

  // 使用 useCallback 優化事件處理函數
  const handleHazardFilter = useCallback((hazardType) => {
    setSelectedHazard(hazardType);
  }, []);

  const handleMapLoad = useCallback(() => {
    setMapLoaded(true);
    setError(null);
  }, []);

  const handleMapError = useCallback((errorMessage) => {
    setError(errorMessage);
    setMapLoaded(false);
  }, []);

  const handleZoomStart = useCallback(() => {
    setIsZooming(true);
  }, []);

  const handleZoomEnd = useCallback(() => {
    setIsZooming(false);
  }, []);

  // 提供計算屬性
  const hasActiveFilters = selectedHazard !== 'all';
  const activeHazardCount = filteredHazards.length;
  const allHazardTypes = Object.keys(hazardTypes);

  return {
    // 狀態
    selectedHazard,
    filteredHazards,
    mapLoaded,
    error,
    isZooming,
    hazardStats,
    
    // 計算屬性
    hasActiveFilters,
    activeHazardCount,
    allHazardTypes,
    
    // 事件處理函數
    handleHazardFilter,
    handleMapLoad,
    handleMapError,
    handleZoomStart,
    handleZoomEnd,
    
    // 原始設定函數
    setSelectedHazard,
    setMapLoaded,
    setError,
    setIsZooming
  };
}; 