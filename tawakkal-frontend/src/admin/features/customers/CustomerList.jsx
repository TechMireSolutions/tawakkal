import { useState, useEffect, useMemo } from 'react';
import { HiOutlineMagnifyingGlass, HiOutlineEnvelope, HiOutlinePhone, HiOutlineMapPin } from 'react-icons/hi2';
import { PageContainer, PageHeader } from '../../components/ui/PageLayout';
import { ContentCard } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import Pagination from '../../components/ui/Pagination';
import Avatar from '../../components/ui/Avatar';
import Modal from '../../components/ui/Modal';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { getCustomers } from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/formatters';

export default function CustomerList() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const PAGE_SIZE = 10;

  useEffect(() => {
    (async () => { try { const res = await getCustomers(); setCustomers(Array.isArray(res) ? res : (res?.results || [])); } finally { setLoading(false); } })();
  }, []);

  const filtered = useMemo(() => {
    if (!search) return customers;
    const q = search.toLowerCase();
    return customers.filter(c => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q));
  }, [customers, search]);

  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <PageContainer>
      <PageHeader title="Customers" subtitle={`${customers.length} registered customers`} breadcrumbs={[{ label: 'Customers' }]} />
      <ContentCard noPadding>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--admin-border-light)' }}>
          <Input placeholder="Search customers..." icon={HiOutlineMagnifyingGlass} value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} size="sm" containerClassName="admin-product-search" />
        </div>
        {loading ? <TableSkeleton rows={5} columns={6} /> : filtered.length === 0 ? <EmptyState title="No customers found" /> : (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table" style={{ minWidth: '800px' }}>
              <thead><tr><th>Customer</th><th>City</th><th>Status</th><th style={{ textAlign: 'center' }}>Orders</th><th style={{ textAlign: 'right' }}>Lifetime Value</th><th>Last Order</th></tr></thead>
              <tbody>
                {paginated.map(c => (
                  <tr key={c.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedCustomer(c)}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Avatar name={c.name} size="sm" status={c.status === 'active' ? 'online' : 'offline'} />
                        <div>
                          <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--admin-text)', margin: 0 }}>{c.name}</p>
                          <p style={{ fontSize: '12px', color: 'var(--admin-text-muted)', margin: '2px 0 0' }}>{c.email}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: '13px', color: 'var(--admin-text-secondary)' }}>{c.city}</td>
                    <td><Badge variant={c.status === 'active' ? 'success' : 'neutral'} dot>{c.status === 'active' ? 'Active' : 'Inactive'}</Badge></td>
                    <td style={{ textAlign: 'center', fontWeight: 600 }}>{c.totalOrders}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--admin-text)' }}>{formatCurrency(c.totalSpent)}</td>
                    <td style={{ fontSize: '12px', color: 'var(--admin-text-muted)' }}>{formatDate(c.lastOrder)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {filtered.length > PAGE_SIZE && <div style={{ padding: '0 20px' }}><Pagination currentPage={currentPage} totalPages={Math.ceil(filtered.length / PAGE_SIZE)} totalItems={filtered.length} pageSize={PAGE_SIZE} onPageChange={setCurrentPage} /></div>}
      </ContentCard>

      <Modal isOpen={!!selectedCustomer} onClose={() => setSelectedCustomer(null)} title="Customer Profile" size="md">
        {selectedCustomer && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <Avatar name={selectedCustomer.name} size="xl" status={selectedCustomer.status === 'active' ? 'online' : 'offline'} />
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--admin-text)', margin: 0, fontFamily: 'var(--admin-font-display)' }}>{selectedCustomer.name}</h3>
                <p style={{ fontSize: '13px', color: 'var(--admin-text-secondary)', margin: '4px 0 0' }}>Customer since {formatDate(selectedCustomer.joinedAt)}</p>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              {[
                { label: 'Total Orders', value: selectedCustomer.totalOrders },
                { label: 'Lifetime Value', value: formatCurrency(selectedCustomer.totalSpent) },
                { label: 'Avg Order', value: formatCurrency(Math.round(selectedCustomer.totalSpent / (selectedCustomer.totalOrders || 1))) },
              ].map(s => (
                <div key={s.label} style={{ padding: '16px', borderRadius: 'var(--admin-radius-lg)', border: '1px solid var(--admin-border-light)', textAlign: 'center' }}>
                  <p style={{ fontSize: '11px', color: 'var(--admin-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 6px' }}>{s.label}</p>
                  <p style={{ fontSize: '18px', fontWeight: 700, color: 'var(--admin-text)', margin: 0, fontFamily: 'var(--admin-font-display)' }}>{s.value}</p>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { icon: HiOutlineEnvelope, text: selectedCustomer.email },
                { icon: HiOutlinePhone, text: selectedCustomer.phone },
                { icon: HiOutlineMapPin, text: selectedCustomer.city },
              ].map((info, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0' }}>
                  <info.icon size={16} style={{ color: 'var(--admin-text-muted)', flexShrink: 0 }} />
                  <span style={{ fontSize: '13px', color: 'var(--admin-text-secondary)' }}>{info.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </PageContainer>
  );
}
