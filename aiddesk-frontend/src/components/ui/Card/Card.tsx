import React from 'react';
import styles from './Card.module.css';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
}

const Card: React.FC<CardProps> = ({ children, className, padding = 'md' }) => {
  return (
    <div
      className={[styles.card, styles[`padding-${padding}`], className ?? '']
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </div>
  );
};

export default Card;
