import React from 'react';
import styles from './Spinner.module.css';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  centered?: boolean;
}

const Spinner: React.FC<SpinnerProps> = ({ size = 'md', centered = false }) => {
  return (
    <div className={centered ? styles.centered : undefined} aria-label="Загрузка...">
      <div className={[styles.spinner, styles[size]].join(' ')} />
    </div>
  );
};

export default Spinner;
