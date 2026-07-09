import { forwardRef } from 'react';

const Input = forwardRef(function Input(
  {
    label,
    error,
    hint,
    icon: Icon,
    iconRight: IconRight,
    size = 'md',
    className = '',
    containerClassName = '',
    required = false,
    ...props
  },
  ref
) {
  const sizeMap = {
    sm: { height: '36px', fontSize: '13px', padding: '8px 12px', iconPad: '36px' },
    md: { height: '42px', fontSize: '14px', padding: '10px 14px', iconPad: '42px' },
    lg: { height: '48px', fontSize: '15px', padding: '12px 16px', iconPad: '48px' },
  };
  const s = sizeMap[size] || sizeMap.md;

  return (
    <div className={containerClassName} style={{ width: '100%' }}>
      {label && (
        <label
          style={{
            display: 'block',
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--admin-text)',
            marginBottom: '6px',
            fontFamily: 'var(--admin-font-sans)',
          }}
        >
          {label}
          {required && <span style={{ color: 'var(--admin-danger)', marginLeft: '3px' }}>*</span>}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        {Icon && (
          <div
            style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--admin-text-muted)',
              pointerEvents: 'none',
              display: 'flex',
            }}
          >
            <Icon size={18} />
          </div>
        )}
        <input
          ref={ref}
          className={className}
          style={{
            width: '100%',
            height: s.height,
            padding: s.padding,
            paddingLeft: Icon ? s.iconPad : undefined,
            paddingRight: IconRight ? s.iconPad : undefined,
            fontSize: s.fontSize,
            fontFamily: 'var(--admin-font-sans)',
            fontWeight: 400,
            color: 'var(--admin-text)',
            background: 'var(--admin-surface)',
            border: `1px solid ${error ? 'var(--admin-danger)' : 'var(--admin-border)'}`,
            borderRadius: 'var(--admin-radius-lg)',
            outline: 'none',
            transition: 'all var(--admin-transition-fast)',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = error ? 'var(--admin-danger)' : 'var(--admin-border-focus)';
            e.target.style.boxShadow = `0 0 0 3px ${error ? 'rgba(220,38,38,0.1)' : 'rgba(27,54,34,0.1)'}`;
          }}
          onBlur={(e) => {
            e.target.style.borderColor = error ? 'var(--admin-danger)' : 'var(--admin-border)';
            e.target.style.boxShadow = 'none';
          }}
          {...props}
        />
        {IconRight && (
          <div
            style={{
              position: 'absolute',
              right: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--admin-text-muted)',
              display: 'flex',
            }}
          >
            <IconRight size={18} />
          </div>
        )}
      </div>
      {error && (
        <p style={{ fontSize: '12px', color: 'var(--admin-danger)', marginTop: '4px', fontWeight: 500 }}>
          {error}
        </p>
      )}
      {hint && !error && (
        <p style={{ fontSize: '12px', color: 'var(--admin-text-muted)', marginTop: '4px' }}>
          {hint}
        </p>
      )}
    </div>
  );
});

export const Textarea = forwardRef(function Textarea({ label, error, required, rows = 4, ...props }, ref) {
  return (
    <div style={{ width: '100%' }}>
      {label && (
        <label
          style={{
            display: 'block',
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--admin-text)',
            marginBottom: '6px',
            fontFamily: 'var(--admin-font-sans)',
          }}
        >
          {label}
          {required && <span style={{ color: 'var(--admin-danger)', marginLeft: '3px' }}>*</span>}
        </label>
      )}
      <textarea
        ref={ref}
        rows={rows}
        style={{
          width: '100%',
          padding: '10px 14px',
          fontSize: '14px',
          fontFamily: 'var(--admin-font-sans)',
          color: 'var(--admin-text)',
          background: 'var(--admin-surface)',
          border: `1px solid ${error ? 'var(--admin-danger)' : 'var(--admin-border)'}`,
          borderRadius: 'var(--admin-radius-lg)',
          outline: 'none',
          resize: 'vertical',
          transition: 'all var(--admin-transition-fast)',
          minHeight: '100px',
        }}
        onFocus={(e) => {
          e.target.style.borderColor = error ? 'var(--admin-danger)' : 'var(--admin-border-focus)';
          e.target.style.boxShadow = `0 0 0 3px ${error ? 'rgba(220,38,38,0.1)' : 'rgba(27,54,34,0.1)'}`;
        }}
        onBlur={(e) => {
          e.target.style.borderColor = error ? 'var(--admin-danger)' : 'var(--admin-border)';
          e.target.style.boxShadow = 'none';
        }}
        {...props}
      />
      {error && (
        <p style={{ fontSize: '12px', color: 'var(--admin-danger)', marginTop: '4px', fontWeight: 500 }}>
          {error}
        </p>
      )}
    </div>
  );
});

export default Input;
