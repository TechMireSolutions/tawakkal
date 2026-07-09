import { motion } from 'framer-motion';
import { HiOutlineArrowTrendingUp, HiOutlineArrowTrendingDown } from 'react-icons/hi2';
import { formatNumber } from '../../utils/formatters';

export default function StatCard({
  title,
  value,
  change,
  changeLabel = 'vs last period',
  icon: Icon,
  trend = 'up', // 'up' | 'down' | 'neutral'
  accentColor,
  index = 0,
}) {
  const isPositive = trend === 'up';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: 'easeOut' }}
      whileHover={{ y: -3, boxShadow: 'var(--admin-shadow-lg)' }}
      style={{
        background: 'var(--admin-surface)',
        borderRadius: 'var(--admin-radius-xl)',
        border: '1px solid var(--admin-border-light)',
        boxShadow: 'var(--admin-shadow-xs)',
        padding: '24px',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'default',
        transition: 'all var(--admin-transition-base)',
      }}
    >
      {/* Subtle accent bar */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: accentColor || 'var(--admin-primary)',
          opacity: 0.6,
        }}
      />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ flex: 1 }}>
          <p
            style={{
              fontSize: '12px',
              fontWeight: 500,
              color: 'var(--admin-text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              margin: '0 0 12px 0',
            }}
          >
            {title}
          </p>
          <p
            style={{
              fontSize: '28px',
              fontWeight: 800,
              color: 'var(--admin-text)',
              fontFamily: 'var(--admin-font-display)',
              margin: '0 0 8px 0',
              letterSpacing: '-0.02em',
              lineHeight: 1,
            }}
          >
            {typeof value === 'number' ? formatNumber(value) : value}
          </p>
          {change !== undefined && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: isPositive ? 'var(--admin-success)' : 'var(--admin-danger)',
                  background: isPositive ? 'var(--admin-success-light)' : 'var(--admin-danger-light)',
                  padding: '2px 8px',
                  borderRadius: 'var(--admin-radius-full)',
                }}
              >
                {isPositive ? <HiOutlineArrowTrendingUp size={14} /> : <HiOutlineArrowTrendingDown size={14} />}
                {change}
              </span>
              <span style={{ fontSize: '11px', color: 'var(--admin-text-muted)' }}>{changeLabel}</span>
            </div>
          )}
        </div>
        {Icon && (
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 'var(--admin-radius-lg)',
              background: accentColor ? `${accentColor}15` : 'var(--admin-primary-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: accentColor || 'var(--admin-primary)',
              flexShrink: 0,
            }}
          >
            <Icon size={22} />
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function StatGrid({ children, columns = 4 }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: '20px',
      }}
      className="admin-stat-grid"
    >
      <style>{`
        @media (max-width: 1200px) { .admin-stat-grid { grid-template-columns: repeat(3, 1fr) !important; } }
        @media (max-width: 900px) { .admin-stat-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 600px) { .admin-stat-grid { grid-template-columns: 1fr !important; } }
      `}</style>
      {children}
    </div>
  );
}
