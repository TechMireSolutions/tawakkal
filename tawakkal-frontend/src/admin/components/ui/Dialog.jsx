import { HiExclamationTriangle, HiOutlineTrash, HiOutlineExclamationCircle } from 'react-icons/hi2';
import Modal from './Modal';
import Button from './Button';

export default function Dialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger', // 'danger' | 'warning' | 'info'
  loading = false,
}) {
  const icons = {
    danger: HiOutlineTrash,
    warning: HiExclamationTriangle,
    info: HiOutlineExclamationCircle,
  };
  const colors = {
    danger: { bg: 'var(--admin-danger-light)', color: 'var(--admin-danger)' },
    warning: { bg: 'var(--admin-warning-light)', color: 'var(--admin-warning)' },
    info: { bg: 'var(--admin-info-light)', color: 'var(--admin-info)' },
  };
  const Icon = icons[variant];
  const c = colors[variant];

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div style={{ textAlign: 'center', padding: '12px 0' }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 'var(--admin-radius-xl)',
            background: c.bg,
            color: c.color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
          }}
        >
          <Icon size={28} />
        </div>
        <h3
          style={{
            fontSize: '18px',
            fontWeight: 700,
            color: 'var(--admin-text)',
            fontFamily: 'var(--admin-font-display)',
            margin: '0 0 8px 0',
          }}
        >
          {title}
        </h3>
        <p
          style={{
            fontSize: '14px',
            color: 'var(--admin-text-secondary)',
            lineHeight: 1.6,
            margin: '0 0 28px 0',
          }}
        >
          {message}
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <Button variant="secondary" onClick={onClose} size="md">
            {cancelLabel}
          </Button>
          <Button
            variant={variant === 'danger' ? 'danger' : 'primary'}
            onClick={onConfirm}
            loading={loading}
            size="md"
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
