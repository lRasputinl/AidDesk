import React from 'react';
import styles from './Textarea.module.css';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const Textarea: React.FC<TextareaProps> = ({ label, error, id, className, ...rest }) => {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={styles.wrapper}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        className={[styles.textarea, error ? styles.textareaError : '', className ?? '']
          .filter(Boolean)
          .join(' ')}
        {...rest}
      />
      {error && <span className={styles.error}>{error}</span>}
    </div>
  );
};

export default Textarea;
