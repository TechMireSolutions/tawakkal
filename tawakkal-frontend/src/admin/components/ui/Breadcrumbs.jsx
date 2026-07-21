import { HiChevronRight, HiOutlineHome } from 'react-icons/hi2';
import { Link } from 'react-router-dom';

export function Breadcrumbs({ items = [] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol style={{ display: 'flex', alignItems: 'center', gap: '6px', listStyle: 'none', margin: 0, padding: 0 }}>
        <li>
          <Link
            to="/admin"
            style={{
              display: 'flex',
              alignItems: 'center',
              color: 'var(--admin-text-muted)',
              textDecoration: 'none',
              transition: 'color var(--admin-transition-fast)',
            }}
            onMouseEnter={(e) => e.target.style.color = 'var(--admin-primary)'}
            onMouseLeave={(e) => e.target.style.color = 'var(--admin-text-muted)'}
          >
            <HiOutlineHome size={15} />
          </Link>
        </li>
        {items.map((item, index) => (
          <li key={index} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <HiChevronRight size={14} style={{ color: 'var(--admin-text-muted)', flexShrink: 0 }} />
            {index === items.length - 1 ? (
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 500,
                  color: 'var(--admin-text)',
                }}
              >
                {item.label}
              </span>
            ) : item.onClick ? (
              <span
                onClick={item.onClick}
                style={{
                  fontSize: '13px',
                  fontWeight: 500,
                  color: 'var(--admin-text-muted)',
                  cursor: 'pointer',
                  transition: 'color var(--admin-transition-fast)',
                }}
                onMouseEnter={(e) => e.target.style.color = 'var(--admin-primary)'}
                onMouseLeave={(e) => e.target.style.color = 'var(--admin-text-muted)'}
              >
                {item.label}
              </span>
            ) : (
              <Link
                to={item.path || '#'}
                style={{
                  fontSize: '13px',
                  fontWeight: 500,
                  color: 'var(--admin-text-muted)',
                  textDecoration: 'none',
                  transition: 'color var(--admin-transition-fast)',
                }}
                onMouseEnter={(e) => e.target.style.color = 'var(--admin-primary)'}
                onMouseLeave={(e) => e.target.style.color = 'var(--admin-text-muted)'}
              >
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export default Breadcrumbs;
