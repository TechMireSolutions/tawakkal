import { getInitials } from '../../utils/formatters';

export default function Avatar({ name, src, size = 'md', status }) {
  const sizeMap = {
    xs: { dim: 24, font: 9 },
    sm: { dim: 32, font: 11 },
    md: { dim: 40, font: 13 },
    lg: { dim: 48, font: 15 },
    xl: { dim: 64, font: 20 },
  };
  const s = sizeMap[size] || sizeMap.md;
  const statusColors = {
    online: '#059669',
    offline: '#9CA3AF',
    busy: '#DC2626',
    away: '#D97706',
  };

  return (
    <div style={{ position: 'relative', display: 'inline-flex', flexShrink: 0 }}>
      {src ? (
        <img
          src={src}
          alt={name || 'Avatar'}
          style={{
            width: s.dim,
            height: s.dim,
            borderRadius: 'var(--admin-radius-full)',
            objectFit: 'cover',
            border: '2px solid var(--admin-border-light)',
          }}
        />
      ) : (
        <div
          style={{
            width: s.dim,
            height: s.dim,
            borderRadius: 'var(--admin-radius-full)',
            background: 'var(--admin-primary-light)',
            color: 'var(--admin-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: s.font,
            fontWeight: 700,
            fontFamily: 'var(--admin-font-sans)',
            border: '2px solid var(--admin-border-light)',
          }}
        >
          {getInitials(name)}
        </div>
      )}
      {status && (
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: s.dim * 0.28,
            height: s.dim * 0.28,
            borderRadius: '50%',
            background: statusColors[status] || statusColors.offline,
            border: '2px solid var(--admin-surface)',
          }}
        />
      )}
    </div>
  );
}
