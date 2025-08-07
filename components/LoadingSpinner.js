import React from 'react';
import styles from '../styles/components/loading-spinner.module.css';

const LoadingSpinner = ({ message = '地圖載入中...' }) => {
  return (
    <div className={styles.loadingContainer}>
      <div className={styles.spinner}>
        <div className={styles.spinnerRing}></div>
        <div className={styles.spinnerRing}></div>
        <div className={styles.spinnerRing}></div>
      </div>
      <p className={styles.loadingText}>{message}</p>
    </div>
  );
};

export default LoadingSpinner; 