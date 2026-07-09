import { useState, useEffect, useMemo } from 'react';
import { HiOutlineMagnifyingGlass, HiOutlineEye } from 'react-icons/hi2';
import { PLACEHOLDER_IMAGE } from '../../utils/constants';
import { PageContainer, PageHeader } from '../../components/ui/PageLayout';
import { ContentCard } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import Pagination from '../../components/ui/Pagination';
import Modal from '../../components/ui/Modal';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { getOrders } from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { ORDER_STATUSES, PAYMENT_STATUSES } from '../../utils/constants';

export default function OrderList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const PAGE_SIZE = 10;

  useEffect(() => {
    (async () => {
      try {
        const res = await getOrders();
        setOrders(Array.isArray(res) ? res : (res?.results || []));
      } finally { setLoading(false); }
    })();
  }, []);

  const filtered = useMemo(() => {
    let d = [...orders];
    if (search) { const q = search.toLowerCase(); d = d.filter(o => o.orderNumber.toLowerCase().includes(q) || o.customer.name.toLowerCase().includes(q)); }
    if (statusFilter) d = d.filter(o => o.status === statusFilter);
    return d;
  }, [orders, search, statusFilter]);

  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <PageContainer>
      <PageHeader title="Orders" subtitle={`${orders.length} total orders`} breadcrumbs={[{ label: 'Orders' }]} />

      <ContentCard noPadding>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '16px 20px', borderBottom: '1px solid var(--admin-border-light)', flexWrap: 'wrap' }}>
          <Input placeholder="Search orders..." icon={HiOutlineMagnifyingGlass} value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} size="sm" containerClassName="admin-product-search" />
          <style>{`.admin-product-search{max-width:280px;}`}</style>
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            style={{ height: '36px', padding: '0 12px', fontSize: '13px', fontWeight: 500, border: '1px solid var(--admin-border)', borderRadius: 'var(--admin-radius-lg)', background: 'var(--admin-surface)', fontFamily: 'var(--admin-font-sans)', color: 'var(--admin-text)' }}>
            <option value="">All Status</option>
            {Object.entries(ORDER_STATUSES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>

        {loading ? <TableSkeleton rows={5} columns={6} /> : filtered.length === 0 ? <EmptyState title="No orders found" /> : (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table" style={{ minWidth: '800px' }}>
              <thead><tr><th>Order</th><th>Customer</th><th>Date</th><th>Status</th><th>Payment</th><th style={{ textAlign: 'right' }}>Total</th><th style={{ width: 60 }}></th></tr></thead>
              <tbody>
                {paginated.map(order => {
                  const os = ORDER_STATUSES[order.status] || ORDER_STATUSES.pending;
                  const ps = PAYMENT_STATUSES[order.paymentStatus] || PAYMENT_STATUSES.pending;
                  return (
                    <tr key={order.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedOrder(order)}>
                      <td style={{ fontWeight: 600, color: 'var(--admin-text)' }}>{order.orderNumber}</td>
                      <td>
                        <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--admin-text)', margin: 0 }}>{order.customer.name}</p>
                        <p style={{ fontSize: '12px', color: 'var(--admin-text-muted)', margin: '2px 0 0' }}>{order.customer.email}</p>
                      </td>
                      <td style={{ fontSize: '13px', color: 'var(--admin-text-secondary)' }}>{formatDate(order.createdAt)}</td>
                      <td><Badge variant={os.color} dot>{os.label}</Badge></td>
                      <td><Badge variant={ps.color}>{ps.label}</Badge></td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--admin-text)' }}>{formatCurrency(order.total)}</td>
                      <td><button style={{ width: 32, height: 32, border: 'none', background: 'transparent', color: 'var(--admin-text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--admin-radius-md)' }} onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); }}><HiOutlineEye size={16} /></button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {filtered.length > PAGE_SIZE && <div style={{ padding: '0 20px' }}><Pagination currentPage={currentPage} totalPages={Math.ceil(filtered.length / PAGE_SIZE)} totalItems={filtered.length} pageSize={PAGE_SIZE} onPageChange={setCurrentPage} /></div>}
      </ContentCard>

      {/* Order Detail Modal */}
      <Modal isOpen={!!selectedOrder} onClose={() => setSelectedOrder(null)} title={`Order ${selectedOrder?.orderNumber}`} size="lg">
        {selectedOrder && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Customer Info */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ padding: '16px', borderRadius: 'var(--admin-radius-lg)', border: '1px solid var(--admin-border-light)' }}>
                <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--admin-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 8px' }}>Customer</p>
                <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--admin-text)', margin: 0 }}>{selectedOrder.customer.name}</p>
                <p style={{ fontSize: '12px', color: 'var(--admin-text-secondary)', margin: '4px 0 0' }}>{selectedOrder.customer.email}</p>
                <p style={{ fontSize: '12px', color: 'var(--admin-text-secondary)', margin: '2px 0 0' }}>{selectedOrder.customer.phone}</p>
              </div>
              <div style={{ padding: '16px', borderRadius: 'var(--admin-radius-lg)', border: '1px solid var(--admin-border-light)' }}>
                <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--admin-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 8px' }}>Shipping Address</p>
                <p style={{ fontSize: '13px', color: 'var(--admin-text)', margin: 0 }}>{selectedOrder.shippingAddress.street}</p>
                <p style={{ fontSize: '13px', color: 'var(--admin-text-secondary)', margin: '2px 0 0' }}>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.zip}</p>
              </div>
            </div>
            {/* Items */}
            <div>
              <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--admin-text)', marginBottom: '12px' }}>Items ({selectedOrder.items.length})</p>
              {selectedOrder.items.map(item => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: '1px solid var(--admin-border-light)' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 'var(--admin-radius-md)', overflow: 'hidden', background: 'var(--admin-surface-secondary)', flexShrink: 0 }}>
                    <img src={item.image || PLACEHOLDER_IMAGE} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--admin-text)', margin: 0 }}>{item.name}</p>
                    <p style={{ fontSize: '12px', color: 'var(--admin-text-muted)', margin: 0 }}>Qty: {item.quantity}</p>
                  </div>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--admin-text)' }}>{formatCurrency(item.price * item.quantity)}</p>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '12px' }}>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '12px', color: 'var(--admin-text-muted)', margin: '4px 0' }}>Subtotal: {formatCurrency(selectedOrder.subtotal)}</p>
                  <p style={{ fontSize: '12px', color: 'var(--admin-text-muted)', margin: '4px 0' }}>Shipping: {formatCurrency(selectedOrder.shipping)}</p>
                  {selectedOrder.discount > 0 && <p style={{ fontSize: '12px', color: 'var(--admin-success)', margin: '4px 0' }}>Discount: -{formatCurrency(selectedOrder.discount)}</p>}
                  <p style={{ fontSize: '16px', fontWeight: 700, color: 'var(--admin-text)', margin: '8px 0 0' }}>Total: {formatCurrency(selectedOrder.total)}</p>
                </div>
              </div>
            </div>
            {/* Timeline */}
            <div>
              <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--admin-text)', marginBottom: '12px' }}>Order Timeline</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                {selectedOrder.timeline.map((event, i) => (
                  <div key={i} style={{ display: 'flex', gap: '12px', paddingBottom: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: i === selectedOrder.timeline.length - 1 ? 'var(--admin-primary)' : 'var(--admin-border)', border: i === selectedOrder.timeline.length - 1 ? '3px solid var(--admin-primary-light)' : 'none', flexShrink: 0 }} />
                      {i < selectedOrder.timeline.length - 1 && <div style={{ width: 2, flex: 1, background: 'var(--admin-border-light)', marginTop: 4 }} />}
                    </div>
                    <div>
                      <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--admin-text)', margin: 0, textTransform: 'capitalize' }}>{event.status}</p>
                      <p style={{ fontSize: '12px', color: 'var(--admin-text-secondary)', margin: '2px 0' }}>{event.note}</p>
                      <p style={{ fontSize: '11px', color: 'var(--admin-text-muted)' }}>{formatDate(event.date)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </PageContainer>
  );
}
