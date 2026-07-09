import { Breadcrumbs } from './Breadcrumbs';
import Button from './Button';

/**
 * PageHeader — standard page title with breadcrumbs, subtitle, and primary action
 */
export function PageHeader({
  title,
  subtitle,
  breadcrumbs = [],
  action,
  actionLabel,
  actionIcon,
  onAction,
  secondaryAction,
  primaryAction,
  children,
}) {
  return (
    <div style={{ marginBottom: '28px' }}>
      {breadcrumbs.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <Breadcrumbs items={breadcrumbs} />
        </div>
      )}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '16px',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '24px',
              fontWeight: 800,
              color: 'var(--admin-text)',
              fontFamily: 'var(--admin-font-display)',
              margin: 0,
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
            }}
          >
            {title}
          </h1>
          {subtitle && (
            <p
              style={{
                fontSize: '14px',
                color: 'var(--admin-text-secondary)',
                margin: '6px 0 0 0',
                lineHeight: 1.5,
              }}
            >
              {subtitle}
            </p>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          {secondaryAction}
          {(action || onAction) && (
            <Button variant="primary" icon={actionIcon} onClick={onAction} size="md">
              {actionLabel || 'Create New'}
            </Button>
          )}
          {primaryAction}
          {children}
        </div>
      </div>
    </div>
  );
}

/**
 * SectionHeader — smaller header for content sections within a page
 */
export function SectionHeader({ title, subtitle, action, children }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px',
        gap: '12px',
      }}
    >
      <div>
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
        {subtitle && (
          <p style={{ fontSize: '13px', color: 'var(--admin-text-secondary)', margin: '4px 0 0 0' }}>
            {subtitle}
          </p>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {action}
        {children}
      </div>
    </div>
  );
}

/**
 * PageContainer — main content wrapper with max width and padding
 */
export function PageContainer({ children, className = '' }) {
  return (
    <div
      className={className}
      style={{
        padding: '28px 32px 48px',
        maxWidth: '1400px',
        width: '100%',
      }}
    >
      {children}
    </div>
  );
}

/**
 * FormSection — section wrapper for form groups
 */
export function FormSection({ title, subtitle, children }) {
  return (
    <div
      style={{
        background: 'var(--admin-surface)',
        borderRadius: 'var(--admin-radius-xl)',
        border: '1px solid var(--admin-border-light)',
        padding: '24px',
        marginBottom: '20px',
      }}
    >
      {title && (
        <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--admin-border-light)' }}>
          <h4
            style={{
              fontSize: '15px',
              fontWeight: 700,
              color: 'var(--admin-text)',
              fontFamily: 'var(--admin-font-display)',
              margin: 0,
            }}
          >
            {title}
          </h4>
          {subtitle && (
            <p style={{ fontSize: '13px', color: 'var(--admin-text-secondary)', margin: '4px 0 0 0' }}>
              {subtitle}
            </p>
          )}
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>{children}</div>
    </div>
  );
}

/**
 * ActionBar — bottom-sticky action bar for forms
 */
export function ActionBar({ children, className = '' }) {
  return (
    <div
      className={className}
      style={{
        position: 'sticky',
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: '12px',
        padding: '16px 24px',
        background: 'var(--admin-surface)',
        borderTop: '1px solid var(--admin-border-light)',
        borderRadius: '0 0 var(--admin-radius-xl) var(--admin-radius-xl)',
        zIndex: 10,
      }}
    >
      {children}
    </div>
  );
}
