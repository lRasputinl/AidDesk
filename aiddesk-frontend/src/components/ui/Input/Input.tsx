import React from 'react';
import styles from './Input.module.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Input: React.FC<InputProps> = ({ label, error, hint, id, className, ...rest }) => {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={styles.wrapper}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={[styles.input, error ? styles.inputError : '', className ?? '']
          .filter(Boolean)
          .join(' ')}
        {...rest}
      />
      {error && <span className={styles.error}>{error}</span>}
      {hint && !error && <span className={styles.hint}>{hint}</span>}
    </div>
  );
};

export default Input;
