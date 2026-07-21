/* eslint-disable react-refresh/only-export-components */
import { useState, createContext, useContext, useCallback, useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { HiCheckCircle, HiExclamationCircle, HiInformationCircle, HiXCircle, HiXMark } from 'react-icons/hi2';

const ToastContext = createContext(null);

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ type = 'info', title, message, duration = 4000 }) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
    return id;
  }, []);

  useEffect(() => {
    const handleGlobalToast = (e) => {
      addToast(e.detail);
    };
    window.addEventListener('global-toast', handleGlobalToast);
    return () => window.removeEventListener('global-toast', handleGlobalToast);
  }, [addToast]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useMemo(() => ({
    success: (title, message) => addToast({ type: 'success', title, message }),
    error: (title, message) => addToast({ type: 'error', title, message }),
    warning: (title, message) => addToast({ type: 'warning', title, message }),
    info: (title, message) => addToast({ type: 'info', title, message }),
  }), [addToast]);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}

function ToastContainer({ toasts, removeToast }) {
  const icons = {
    success: HiCheckCircle,
    error: HiXCircle,
    warning: HiExclamationCircle,
    info: HiInformationCircle,
  };
  const colors = {
    success: { bg: '#059669', light: '#ECFDF5' },
    error: { bg: '#DC2626', light: '#FEF2F2' },
    warning: { bg: '#D97706', light: '#FFFBEB' },
    info: { bg: '#2563EB', light: '#EFF6FF' },
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        maxWidth: '400px',
        width: '100%',
        pointerEvents: 'none',
      }}
    >
      <AnimatePresence>
        {toasts.map((t) => {
          const Icon = icons[t.type];
          const c = colors[t.type];
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 100, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              style={{
                background: 'var(--admin-surface)',
                borderRadius: 'var(--admin-radius-lg)',
                boxShadow: 'var(--admin-shadow-lg)',
                border: '1px solid var(--admin-border-light)',
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                pointerEvents: 'all',
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              {/* Accent line */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  bottom: 0,
                  width: '3px',
                  background: c.bg,
                }}
              />
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 'var(--admin-radius-md)',
                  background: c.light,
                  color: c.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Icon size={16} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                {t.title && (
                  <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--admin-text)', margin: 0 }}>
                    {t.title}
                  </p>
                )}
                {t.message && (
                  <p style={{ fontSize: '12px', color: 'var(--admin-text-secondary)', margin: t.title ? '2px 0 0' : 0 }}>
                    {t.message}
                  </p>
                )}
              </div>
              <button
                onClick={() => removeToast(t.id)}
                style={{
                  width: 24,
                  height: 24,
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--admin-text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 'var(--admin-radius-sm)',
                  flexShrink: 0,
                }}
              >
                <HiXMark size={16} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

export default ToastProvider;
