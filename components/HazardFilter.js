import { memo } from 'react';
import { hazardTypes } from '../data/mapData';
import { useTranslation } from '../contexts/LanguageContext';
import uiStyles from '../styles/components/ui.module.css';

/**
 * 危險類型篩選組件
 * 使用 memo 優化渲染效能
 */
const HazardFilter = memo(({ 
  selectedHazard, 
  onHazardFilter, 
  hazardStats,
  className = '' 
}) => {
  const { t } = useTranslation();

  return (
    <div className={`${uiStyles.filterSection} ${className}`}>
      <h3>{t('filters.title')}</h3>
      <div className={uiStyles.filterOptions}>
        <button 
          className={`${uiStyles.filterBtn} ${selectedHazard === 'all' ? uiStyles.active : ''}`}
          onClick={() => onHazardFilter('all')}
        >
          {t('filters.allTypes')}
          {hazardStats && (
            <span className={uiStyles.filterCount}>
              ({hazardStats.total})
            </span>
          )}
        </button>
        {Object.entries(hazardTypes).map(([key, value]) => (
          <button 
            key={key}
            className={`${uiStyles.filterBtn} ${selectedHazard === key ? uiStyles.active : ''}`}
            onClick={() => onHazardFilter(key)}
            style={{ borderLeftColor: value.color }}
          >
            <span 
              className={uiStyles.hazardIcon}
              style={{ backgroundImage: `url(${value.icon})` }}
            />
            {t(`hazardTypes.${key}`)}
            {hazardStats && (
              <span className={uiStyles.filterCount}>
                ({hazardStats.byType[key] || 0})
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
});

HazardFilter.displayName = 'HazardFilter';

export default HazardFilter; 