import { motion } from 'framer-motion';

export function Card({ children, className = '', hover = true, padding = true, style = {}, ...props }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      whileHover={hover ? { y: -2, boxShadow: 'var(--admin-shadow-lg)' } : {}}
      className={className}
      style={{
        background: 'var(--admin-surface)',
        borderRadius: 'var(--admin-radius-xl)',
        border: '1px solid var(--admin-border-light)',
        boxShadow: 'var(--admin-shadow-xs)',
        padding: padding ? '24px' : '0',
        transition: 'all var(--admin-transition-base)',
        ...style,
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function ContentCard({ title, subtitle, action, children, className = '', noPadding = false }) {
  return (
    <Card padding={false} hover={false} className={className} style={{ minWidth: 0 }}>
      {(title || action) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 24px',
            borderBottom: '1px solid var(--admin-border-light)',
          }}
        >
          <div>
            {title && (
              <h3
                style={{
                  fontSize: '16px',
                  fontWeight: 700,
                  color: 'var(--admin-text)',
                  fontFamily: 'var(--admin-font-display)',
                  margin: 0,
                }}
              >
                {title}
              </h3>
            )}
            {subtitle && (
              <p
                style={{
                  fontSize: '13px',
                  color: 'var(--admin-text-secondary)',
                  margin: '4px 0 0 0',
                }}
              >
                {subtitle}
              </p>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div style={{ padding: noPadding ? 0 : '24px' }}>{children}</div>
    </Card>
  );
}

export default Card;
