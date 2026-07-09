import { HiOutlineInboxStack, HiOutlineMagnifyingGlass, HiOutlineWifi, HiOutlineExclamationTriangle } from 'react-icons/hi2';
import Button from './Button';

export function EmptyState({
  icon: Icon = HiOutlineInboxStack,
  title = 'No data found',
  message = 'There are no items to display at this time.',
  action,
  actionLabel = 'Create New',
  onAction,
}) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px', maxWidth: '400px', margin: '0 auto' }}>
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 'var(--admin-radius-xl)',
          background: 'var(--admin-surface-secondary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
          color: 'var(--admin-text-muted)',
        }}
      >
        <Icon size={28} />
      </div>
      <h3
        style={{
          fontSize: '16px',
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
          margin: '0 0 24px 0',
        }}
      >
        {message}
      </p>
      {(action || onAction) && (
        <Button variant="primary" onClick={onAction} size="sm">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export function NoSearchResults({ query = '' }) {
  return (
    <EmptyState
      icon={HiOutlineMagnifyingGlass}
      title="No results found"
      message={query ? `No results found for "${query}". Try adjusting your search or filters.` : 'Try adjusting your search criteria.'}
    />
  );
}

export function OfflinePlaceholder() {
  return (
    <EmptyState
      icon={HiOutlineWifi}
      title="You're offline"
      message="Check your internet connection and try again."
      actionLabel="Retry"
      onAction={() => window.location.reload()}
    />
  );
}

export function ErrorState({ message = 'Something went wrong', onRetry }) {
  return (
    <EmptyState
      icon={HiOutlineExclamationTriangle}
      title="Error"
      message={message}
      actionLabel="Try Again"
      onAction={onRetry}
    />
  );
}

export default EmptyState;
