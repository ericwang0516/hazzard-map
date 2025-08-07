import { memo } from 'react';
import { getHazardIcon } from '../data/mapData';
import { useTranslation } from '../contexts/LanguageContext';
import uiStyles from '../styles/components/ui.module.css';

/**
 * 危險區域列表組件
 * 使用 memo 優化渲染效能
 */
const HazardList = memo(({ 
  hazards, 
  onHazardClick,
  className = '' 
}) => {
  const { t } = useTranslation();

  if (!hazards || hazards.length === 0) {
    return (
      <div className={`${uiStyles.hazardList} ${className}`}>
        <h3>{t('hazardList.title')}</h3>
        <div className={uiStyles.hazardItems}>
          <div className={uiStyles.hazardEmpty}>
            {t('hazardList.noHazards')}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${uiStyles.hazardList} ${className}`}>
      <h3>
        {t('hazardList.title')}
        <span className={uiStyles.hazardCount}>
          ({hazards.length})
        </span>
      </h3>
      <div className={uiStyles.hazardItems}>
        {hazards.map(hazard => (
          <div 
            key={hazard.id} 
            className={uiStyles.hazardItem}
            onClick={() => onHazardClick?.(hazard)}
          >
            <div className={uiStyles.hazardInfo}>
              <span 
                className={uiStyles.hazardIcon}
                style={{ backgroundImage: `url(${getHazardIcon(hazard.type, hazard.level)})` }}
              />
              <div>
                <h4>{hazard.name}</h4>
                <p className={uiStyles.hazardType}>
                  {t(`hazardTypes.${hazard.type}`)}
                </p>
                <p className={uiStyles.hazardBuilding}>
                  {hazard.building || t('common.noBuildingSpecified')}
                </p>
              </div>
            </div>
            <div className={`${uiStyles.hazardLevel} ${uiStyles[hazard.level]}`}>
              {t(`hazardLevels.${hazard.level}`)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

HazardList.displayName = 'HazardList';

export default HazardList; 