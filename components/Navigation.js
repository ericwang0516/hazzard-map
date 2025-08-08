'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useTranslation } from '../contexts/LanguageContext';
import styles from '../styles/components/navigation.module.css';

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useTranslation();
  const isMap = pathname === '/';
  const buttonText = isMap ? t('navigation.toStorage') : t('navigation.toMap');
  const target = isMap ? '/storage' : '/';

  return (
    <button
      className={styles.navButton}
      type="button"
      onClick={() => router.push(target)}
    >
      {buttonText}
    </button>
  );
};