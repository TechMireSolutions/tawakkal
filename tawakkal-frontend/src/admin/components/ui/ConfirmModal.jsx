import Modal from './Modal';
import { HiExclamationTriangle, HiInformationCircle } from 'react-icons/hi2';

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger' // 'danger', 'primary', 'warning', 'info'
}) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: <HiExclamationTriangle className="w-6 h-6 text-red-600" />,
          iconBg: 'bg-red-100',
          btnClass: 'bg-red-600 text-white hover:bg-red-700',
        };
      case 'warning':
        return {
          icon: <HiExclamationTriangle className="w-6 h-6 text-yellow-600" />,
          iconBg: 'bg-yellow-100',
          btnClass: 'bg-yellow-600 text-white hover:bg-yellow-700',
        };
      case 'info':
      case 'primary':
      default:
        return {
          icon: <HiInformationCircle className="w-6 h-6 text-blue-600" />,
          iconBg: 'bg-blue-100',
          btnClass: 'bg-blue-600 text-white hover:bg-blue-700',
        };
    }
  };

  const styles = getVariantStyles();

  const footer = (
    <div className="flex justify-end gap-3 w-full">
      <button
        onClick={onClose}
        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-charcoal"
      >
        {cancelText}
      </button>
      <button
        onClick={() => {
          onConfirm();
          onClose();
        }}
        className={`px-4 py-2 text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${variant === 'danger' ? 'red-600' : 'blue-600'} transition-colors ${styles.btnClass}`}
      >
        {confirmText}
      </button>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm" footer={footer}>
      <div className="flex items-start gap-4 p-2">
        <div className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full ${styles.iconBg}`}>
          {styles.icon}
        </div>
        <div className="flex-1">
          <p className="text-sm text-gray-600 leading-relaxed">
            {message}
          </p>
        </div>
      </div>
    </Modal>
  );
}
