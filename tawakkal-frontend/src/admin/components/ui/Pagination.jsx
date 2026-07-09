import { HiChevronLeft, HiChevronRight } from 'react-icons/hi2';

export default function Pagination({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  pageSize = 10,
  onPageChange,
}) {
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  if (totalPages <= 1) return null;

  const btnBase = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '34px',
    height: '34px',
    borderRadius: 'var(--admin-radius-md)',
    border: '1px solid var(--admin-border)',
    background: 'var(--admin-surface)',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 600,
    fontFamily: 'var(--admin-font-sans)',
    color: 'var(--admin-text-secondary)',
    transition: 'all var(--admin-transition-fast)',
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 0',
        gap: '16px',
        flexWrap: 'wrap',
      }}
    >
      <p style={{ fontSize: '13px', color: 'var(--admin-text-muted)', margin: 0 }}>
        Showing <strong style={{ color: 'var(--admin-text)' }}>{startItem}–{endItem}</strong> of{' '}
        <strong style={{ color: 'var(--admin-text)' }}>{totalItems}</strong> results
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          style={{ ...btnBase, opacity: currentPage === 1 ? 0.4 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
          aria-label="Previous page"
        >
          <HiChevronLeft size={16} />
        </button>
        {getPageNumbers().map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            style={{
              ...btnBase,
              background: page === currentPage ? 'var(--admin-primary)' : 'var(--admin-surface)',
              color: page === currentPage ? 'var(--admin-text-inverse)' : 'var(--admin-text-secondary)',
              borderColor: page === currentPage ? 'var(--admin-primary)' : 'var(--admin-border)',
              fontWeight: page === currentPage ? 700 : 500,
            }}
          >
            {page}
          </button>
        ))}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          style={{ ...btnBase, opacity: currentPage === totalPages ? 0.4 : 1, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
          aria-label="Next page"
        >
          <HiChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
