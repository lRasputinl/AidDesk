import React from 'react';
import styles from './Skeleton.module.css';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string;
  className?: string;
}

const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = '16px',
  borderRadius = '6px',
  className,
}) => {
  return (
    <div
      className={[styles.skeleton, className ?? ''].filter(Boolean).join(' ')}
      style={{ width, height, borderRadius }}
      aria-hidden="true"
    />
  );
};

export default Skeleton;
