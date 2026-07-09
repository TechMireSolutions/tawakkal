export function Skeleton({ width, height = '16px', borderRadius, className = '', variant = 'text' }) {
  const variantStyles = {
    text: { width: width || '100%', height, borderRadius: borderRadius || 'var(--admin-radius-sm)' },
    circle: { width: width || '40px', height: width || '40px', borderRadius: '50%' },
    card: { width: width || '100%', height: height || '200px', borderRadius: borderRadius || 'var(--admin-radius-xl)' },
    image: { width: width || '100%', height: height || '180px', borderRadius: borderRadius || 'var(--admin-radius-lg)' },
  };
  const s = variantStyles[variant] || variantStyles.text;

  return (
    <div
      className={`admin-skeleton ${className}`}
      style={{
        ...s,
        background: 'var(--admin-bg-secondary)',
        flexShrink: 0,
      }}
    />
  );
}

export function TableSkeleton({ rows = 5, columns = 5 }) {
  return (
    <div style={{ width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', gap: '16px', padding: '12px 16px', borderBottom: '1px solid var(--admin-border-light)' }}>
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} width={i === 0 ? '20px' : `${80 + (i * 17 % 60)}px`} height="12px" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} style={{ display: 'flex', gap: '16px', padding: '16px', borderBottom: '1px solid var(--admin-border-light)', alignItems: 'center' }}>
          {Array.from({ length: columns }).map((_, c) => (
            <Skeleton key={c} width={c === 0 ? '18px' : `${60 + Math.random() * 80}px`} height={c === 1 ? '14px' : '12px'} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div
      style={{
        background: 'var(--admin-surface)',
        borderRadius: 'var(--admin-radius-xl)',
        border: '1px solid var(--admin-border-light)',
        padding: '24px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
        <Skeleton width="120px" height="12px" />
        <Skeleton variant="circle" width="36px" />
      </div>
      <Skeleton width="80px" height="28px" />
      <div style={{ marginTop: '12px' }}>
        <Skeleton width="140px" height="12px" />
      </div>
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div style={{ padding: '32px', maxWidth: '1200px' }}>
      <div style={{ marginBottom: '32px' }}>
        <Skeleton width="200px" height="28px" />
        <div style={{ marginTop: '8px' }}><Skeleton width="300px" height="14px" /></div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
        {[1,2,3,4].map(i => <CardSkeleton key={i} />)}
      </div>
      <div style={{ background: 'var(--admin-surface)', borderRadius: 'var(--admin-radius-xl)', border: '1px solid var(--admin-border-light)' }}>
        <TableSkeleton />
      </div>
    </div>
  );
}

export default Skeleton;
