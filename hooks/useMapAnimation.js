import { useRef, useCallback, useEffect } from 'react';

/**
 * 自定義 Hook：管理地圖動畫
 * 善用 React 的 ref 和效能優化優勢
 */
export const useMapAnimation = () => {
  const animationFramesRef = useRef(new Map());
  const isAnimatingRef = useRef(true);

  // 清理動畫幀
  const cleanupAnimations = useCallback(() => {
    animationFramesRef.current.forEach((frameId) => {
      if (frameId) {
        cancelAnimationFrame(frameId);
      }
    });
    animationFramesRef.current.clear();
  }, []);

  // 創建雷達動畫
  const createRadarAnimation = useCallback((expandingCircle, hazardLevel, hazardType, hazardId) => {
    let animationStep = 0;
    let isAnimating = true;
    
    const animateRadar = () => {
      if (!isAnimating || !isAnimatingRef.current) return;
      
      const progress = (animationStep % 60) / 60;
      const currentRadius = 3 + (hazardLevel.radarRadius - 3) * progress;
      const easeOut = 1 - Math.pow(1 - progress, 2);
      const currentOpacity = Math.max(0, 1 - easeOut);
      const currentFillOpacity = Math.max(0, 0.4 * (1 - easeOut));
      
      expandingCircle.setRadius(currentRadius);
      expandingCircle.setStyle({
        opacity: currentOpacity,
        fillOpacity: currentFillOpacity
      });
      
      animationStep++;
      const frameId = requestAnimationFrame(animateRadar);
      animationFramesRef.current.set(hazardId, frameId);
    };
    
    animateRadar();
    
    return () => {
      isAnimating = false;
      const frameId = animationFramesRef.current.get(hazardId);
      if (frameId) {
        cancelAnimationFrame(frameId);
        animationFramesRef.current.delete(hazardId);
      }
    };
  }, []);

  // 暫停所有動畫
  const pauseAnimations = useCallback(() => {
    isAnimatingRef.current = false;
  }, []);

  // 恢復所有動畫
  const resumeAnimations = useCallback(() => {
    isAnimatingRef.current = true;
  }, []);

  // 組件卸載時清理
  useEffect(() => {
    return () => {
      cleanupAnimations();
    };
  }, [cleanupAnimations]);

  return {
    createRadarAnimation,
    cleanupAnimations,
    pauseAnimations,
    resumeAnimations
  };
}; 