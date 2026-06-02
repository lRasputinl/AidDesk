import React from 'react';
import Modal from '../Modal/Modal';
import Button from '../Button/Button';
import styles from './ConfirmDialog.module.css';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmLabel?: string;
  loading?: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Подтверждение',
  message,
  confirmLabel = 'Удалить',
  loading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <p className={styles.message}>{message}</p>
      <div className={styles.actions}>
        <Button variant="secondary" onClick={onClose} disabled={loading}>
          Отмена
        </Button>
        <Button variant="danger" onClick={onConfirm} loading={loading}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
