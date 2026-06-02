import React from 'react';
import styles from './Badge.module.css';
import { TicketStatus, TicketPriority } from '../../../types';
import { statusLabel, priorityLabel } from '../../../utils/displayNames';

interface BadgeProps {
  label: string;
  type?: 'status' | 'priority' | 'role' | 'comment';
}

function getStatusClass(label: string): string {
  switch (label) {
    case TicketStatus.Waiting:
      return styles.waiting;
    case TicketStatus.InProgress:
      return styles.inProgress;
    case TicketStatus.Done:
      return styles.done;
    default:
      return styles.default;
  }
}

function getPriorityClass(label: string): string {
  switch (label) {
    case TicketPriority.Low:
      return styles.low;
    case TicketPriority.Medium:
      return styles.medium;
    case TicketPriority.High:
      return styles.high;
    default:
      return styles.default;
  }
}

function getCommentClass(label: string): string {
  // Backend stores client comments as "public", support as "Публичный"/"Внутренний"
  return label === 'Внутренний' ? styles.internal : styles.public;
}

/** Normalize the raw DB value to a display label */
function normalizeCommentLabel(label: string): string {
  if (label === 'public') return 'Публичный';
  return label;
}

const Badge: React.FC<BadgeProps> = ({ label, type = 'status' }) => {
  let cls = styles.badge;
  let displayLabel = label;

  if (type === 'status') {
    cls += ' ' + getStatusClass(label);
    displayLabel = statusLabel(label);
  } else if (type === 'priority') {
    cls += ' ' + getPriorityClass(label);
    displayLabel = priorityLabel(label);
  } else if (type === 'comment') {
    const normalized = normalizeCommentLabel(label);
    cls += ' ' + getCommentClass(normalized);
    displayLabel = normalized;
  } else {
    cls += ' ' + styles.default;
  }

  return <span className={cls}>{displayLabel}</span>;
};

export default Badge;
