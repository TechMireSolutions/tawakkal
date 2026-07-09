import { BADGE_VARIANTS } from '../../utils/constants';

export default function Badge({ children, variant = 'neutral', dot = false, size = 'sm', className = '' }) {
  const v = BADGE_VARIANTS[variant] || BADGE_VARIANTS.neutral;
  const sizeStyles = {
    xs: { padding: '2px 6px', fontSize: '10px' },
    sm: { padding: '3px 10px', fontSize: '11px' },
    md: { padding: '4px 12px', fontSize: '12px' },
  };
  const s = sizeStyles[size] || sizeStyles.sm;

  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        padding: s.padding,
        fontSize: s.fontSize,
        fontWeight: 600,
        fontFamily: 'var(--admin-font-sans)',
        letterSpacing: '0.02em',
        borderRadius: 'var(--admin-radius-full)',
        background: v.bg,
        color: v.color,
        border: `1px solid ${v.border}`,
        lineHeight: 1.4,
        whiteSpace: 'nowrap',
      }}
    >
      {dot && (
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: v.color,
            flexShrink: 0,
          }}
        />
      )}
      {children}
    </span>
  );
}
