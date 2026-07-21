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
import { getCustomers, getCustomer, deleteCustomer } from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/formatters';

export default function CustomerList() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const PAGE_SIZE = 10;

  useEffect(() => {
    (async () => {
      try {
        const res = await getCustomers();
        setCustomers(Array.isArray(res) ? res : (res?.results || []));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSelectCustomer = async (customer) => {
    setSelectedCustomer(customer);
    try {
      const fullCustomer = await getCustomer(customer.id);
      if (fullCustomer) {
        setSelectedCustomer(fullCustomer);
      }
    } catch (err) {
      console.error("Failed to load customer detail:", err);
    }
  };

  const filtered = useMemo(() => {
    if (!search) return customers;
    const q = search.toLowerCase();
    return customers.filter(c => {
      const name = c.name || `${c.first_name || ''} ${c.last_name || ''}`.trim();
      const email = c.email || '';
      return name.toLowerCase().includes(q) || email.toLowerCase().includes(q);
    });
  }, [customers, search]);

  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleDeleteAll = async () => {
    if (!window.confirm("Are you sure you want to delete all customers? This action cannot be undone.")) return;
    setLoading(true);
    let errorCount = 0;
    for (const c of customers) {
      try {
        await deleteCustomer(c.id);
      } catch {
        errorCount++;
      }
    }
    const res = await getCustomers();
    setCustomers(Array.isArray(res) ? res : (res?.results || []));
    setLoading(false);
  };

  return (
    <PageContainer>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <PageHeader title="Customers" subtitle={`${customers.length} registered customers`} breadcrumbs={[{ label: 'Customers' }]} />
        <button onClick={handleDeleteAll} style={{ background: 'var(--admin-danger)', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', marginTop: '20px' }}>Delete All</button>
      </div>
      <ContentCard noPadding>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--admin-border-light)' }}>
          <Input placeholder="Search customers..." icon={HiOutlineMagnifyingGlass} value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} size="sm" containerClassName="admin-product-search" />
        </div>
        {loading ? <TableSkeleton rows={5} columns={6} /> : filtered.length === 0 ? <EmptyState title="No customers found" /> : (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table" style={{ minWidth: '800px' }}>
              <thead><tr><th>Customer</th><th>City</th><th>Status</th><th style={{ textAlign: 'center' }}>Orders</th><th style={{ textAlign: 'right' }}>Lifetime Value</th><th>Last Order</th></tr></thead>
              <tbody>
                {paginated.map(c => {
                  const fullName = `${c.first_name || ''} ${c.last_name || ''}`.trim() || c.name || c.email || 'Customer';
                  const email = c.email || '';
                  const city = c.city || (c.addresses?.[0]?.city) || 'N/A';
                  const statusStr = (c.status || 'ACTIVE').toLowerCase();
                  const isActive = statusStr === 'active';
                  const totalOrders = c.total_orders ?? c.totalOrders ?? 0;
                  const totalSpent = c.total_spent ?? c.totalSpent ?? 0;
                  const lastOrder = c.last_order_date || c.lastOrder || c.created_at;

                  return (
                    <tr key={c.id} style={{ cursor: 'pointer' }} onClick={() => handleSelectCustomer(c)}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <Avatar name={fullName} size="sm" status={isActive ? 'online' : 'offline'} />
                          <div>
                            <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--admin-text)', margin: 0 }}>{fullName}</p>
                            <p style={{ fontSize: '12px', color: 'var(--admin-text-muted)', margin: '2px 0 0' }}>{email}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontSize: '13px', color: 'var(--admin-text-secondary)' }}>{city}</td>
                      <td><Badge variant={isActive ? 'success' : 'neutral'} dot>{isActive ? 'Active' : 'Inactive'}</Badge></td>
                      <td style={{ textAlign: 'center', fontWeight: 600 }}>{totalOrders}</td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--admin-text)' }}>{formatCurrency(totalSpent)}</td>
                      <td style={{ fontSize: '12px', color: 'var(--admin-text-muted)' }}>{formatDate(lastOrder)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {filtered.length > PAGE_SIZE && <div style={{ padding: '0 20px' }}><Pagination currentPage={currentPage} totalPages={Math.ceil(filtered.length / PAGE_SIZE)} totalItems={filtered.length} pageSize={PAGE_SIZE} onPageChange={setCurrentPage} /></div>}
      </ContentCard>

      <Modal isOpen={!!selectedCustomer} onClose={() => setSelectedCustomer(null)} title="Customer Profile" size="md">
        {selectedCustomer && (() => {
          const fullName = `${selectedCustomer.first_name || ''} ${selectedCustomer.last_name || ''}`.trim() || selectedCustomer.name || selectedCustomer.email || 'Customer';
          const statusStr = (selectedCustomer.status || 'ACTIVE').toLowerCase();
          const isActive = statusStr === 'active';
          const totalOrders = selectedCustomer.total_orders ?? selectedCustomer.totalOrders ?? 0;
          const totalSpent = selectedCustomer.total_spent ?? selectedCustomer.totalSpent ?? 0;
          const avgOrder = totalOrders > 0 ? (totalSpent / totalOrders) : 0;
          const city = selectedCustomer.city || (selectedCustomer.addresses?.[0]?.city) || 'N/A';
          const phone = selectedCustomer.phone || 'N/A';
          const email = selectedCustomer.email || 'N/A';
          const joinedAt = selectedCustomer.created_at || selectedCustomer.joinedAt;

          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <Avatar name={fullName} size="xl" status={isActive ? 'online' : 'offline'} />
                <div>
                  <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--admin-text)', margin: 0, fontFamily: 'var(--admin-font-display)' }}>{fullName}</h3>
                  <p style={{ fontSize: '13px', color: 'var(--admin-text-secondary)', margin: '4px 0 0' }}>Customer since {formatDate(joinedAt)}</p>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                {[
                  { label: 'Total Orders', value: totalOrders },
                  { label: 'Lifetime Value', value: formatCurrency(totalSpent) },
                  { label: 'Avg Order', value: formatCurrency(Math.round(avgOrder)) },
                ].map(s => (
                  <div key={s.label} style={{ padding: '16px', borderRadius: 'var(--admin-radius-lg)', border: '1px solid var(--admin-border-light)', textAlign: 'center' }}>
                    <p style={{ fontSize: '11px', color: 'var(--admin-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 6px' }}>{s.label}</p>
                    <p style={{ fontSize: '18px', fontWeight: 700, color: 'var(--admin-text)', margin: 0, fontFamily: 'var(--admin-font-display)' }}>{s.value}</p>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { icon: HiOutlineEnvelope, text: email },
                  { icon: HiOutlinePhone, text: phone },
                  { icon: HiOutlineMapPin, text: city },
                ].map((info, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0' }}>
                    <info.icon size={16} style={{ color: 'var(--admin-text-muted)', flexShrink: 0 }} />
                    <span style={{ fontSize: '13px', color: 'var(--admin-text-secondary)' }}>{info.text}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}
      </Modal>
    </PageContainer>
  );
}
