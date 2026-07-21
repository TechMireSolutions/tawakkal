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
import { getOrders, getOrder, updateOrderStatus, deleteOrder } from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { ORDER_STATUSES, PAYMENT_STATUSES } from '../../utils/constants';

export default function OrderList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const PAGE_SIZE = 10;

  useEffect(() => {
    (async () => {
      try {
        const res = await getOrders();
        setOrders(Array.isArray(res) ? res : (res?.results || []));
      } finally { setLoading(false); }
    })();
  }, []);

  const handleSelectOrder = async (order) => {
    setSelectedOrder(order);
    try {
      const fullOrder = await getOrder(order.id);
      if (fullOrder) {
        setSelectedOrder(fullOrder);
      }
    } catch (err) {
      console.error("Failed to load full order detail:", err);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingStatus(true);
    try {
      const updated = await updateOrderStatus(orderId, newStatus);
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(updated || { ...selectedOrder, status: newStatus });
      }
      const res = await getOrders();
      setOrders(Array.isArray(res) ? res : (res?.results || []));
    } catch (err) {
      alert("Failed to update status: " + (err.response?.data?.message || err.message));
    } finally {
      setUpdatingStatus(false);
    }
  };

  const filtered = useMemo(() => {
    let d = [...orders];
    if (search) {
      const q = search.toLowerCase();
      d = d.filter(o => {
        const num = (o.orderNumber || o.order_number || '').toLowerCase();
        const cName = (o.customer?.name || (o.customer_details ? `${o.customer_details.first_name || ''} ${o.customer_details.last_name || ''}` : '')).toLowerCase();
        return num.includes(q) || cName.includes(q);
      });
    }
    if (statusFilter) {
      d = d.filter(o => o.status === statusFilter || o.status?.toUpperCase() === statusFilter.toUpperCase());
    }
    return d;
  }, [orders, search, statusFilter]);

  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleDeleteAll = async () => {
    if (!window.confirm("Are you sure you want to delete all orders? This action cannot be undone.")) return;
    setLoading(true);
    let errorCount = 0;
    for (const o of orders) {
      try {
        await deleteOrder(o.id);
      } catch {
        errorCount++;
      }
    }
    const res = await getOrders();
    setOrders(Array.isArray(res) ? res : (res?.results || []));
    setLoading(false);
  };

  return (
    <PageContainer>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <PageHeader title="Orders" subtitle={`${orders.length} total orders`} breadcrumbs={[{ label: 'Orders' }]} />
        <button onClick={handleDeleteAll} style={{ background: 'var(--admin-danger)', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', marginTop: '20px' }}>Delete All</button>
      </div>

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
                  const statusKey = order.status?.toLowerCase() || 'pending';
                  const paymentKey = (order.paymentStatus || order.payment_status || 'pending').toLowerCase();
                  const os = ORDER_STATUSES[statusKey] || ORDER_STATUSES.pending;
                  const ps = PAYMENT_STATUSES[paymentKey] || PAYMENT_STATUSES.pending;
                  
                  const orderNum = order.orderNumber || order.order_number || order.id;
                  const custName = order.customer?.name || (order.customer_details ? `${order.customer_details.first_name || ''} ${order.customer_details.last_name || ''}`.trim() : 'N/A');
                  const custEmail = order.customer?.email || order.customer_details?.email || '';
                  const orderDate = order.createdAt || order.created_at;
                  const totalAmt = order.total ?? order.total_amount ?? 0;

                  return (
                    <tr key={order.id} style={{ cursor: 'pointer' }} onClick={() => handleSelectOrder(order)}>
                      <td style={{ fontWeight: 600, color: 'var(--admin-text)' }}>{orderNum}</td>
                      <td>
                        <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--admin-text)', margin: 0 }}>{custName}</p>
                        <p style={{ fontSize: '12px', color: 'var(--admin-text-muted)', margin: '2px 0 0' }}>{custEmail}</p>
                      </td>
                      <td style={{ fontSize: '13px', color: 'var(--admin-text-secondary)' }}>{formatDate(orderDate)}</td>
                      <td><Badge variant={os.color} dot>{os.label}</Badge></td>
                      <td><Badge variant={ps.color}>{ps.label}</Badge></td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--admin-text)' }}>{formatCurrency(totalAmt)}</td>
                      <td><button style={{ width: 32, height: 32, border: 'none', background: 'transparent', color: 'var(--admin-text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--admin-radius-md)' }} onClick={(e) => { e.stopPropagation(); handleSelectOrder(order); }}><HiOutlineEye size={16} /></button></td>
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
      <Modal isOpen={!!selectedOrder} onClose={() => setSelectedOrder(null)} title={`Order ${selectedOrder?.orderNumber || selectedOrder?.order_number || ''}`} size="lg">
        {selectedOrder && (() => {
          const custName = selectedOrder.customer?.name || (selectedOrder.customer_details ? `${selectedOrder.customer_details.first_name || ''} ${selectedOrder.customer_details.last_name || ''}`.trim() : 'N/A');
          const custEmail = selectedOrder.customer?.email || selectedOrder.customer_details?.email || 'N/A';
          const custPhone = selectedOrder.customer?.phone || selectedOrder.customer_details?.phone || 'N/A';

          const addr = selectedOrder.shippingAddress || selectedOrder.shipping_address_details || {};
          const street = addr.street || addr.address_line1 || 'N/A';
          const city = addr.city || 'N/A';
          const zip = addr.zip || addr.postal_code || addr.country || '';

          const items = selectedOrder.items || [];
          const timeline = selectedOrder.timeline || selectedOrder.timeline_events || [];
          const subtotal = selectedOrder.subtotal ?? (selectedOrder.total_amount ? (parseFloat(selectedOrder.total_amount) - parseFloat(selectedOrder.shipping_amount || 0)) : 0);
          const shipping = selectedOrder.shipping ?? selectedOrder.shipping_amount ?? 0;
          const discount = selectedOrder.discount ?? selectedOrder.discount_amount ?? 0;
          const total = selectedOrder.total ?? selectedOrder.total_amount ?? 0;
          const currentStatus = (selectedOrder.status || 'PENDING').toUpperCase();

          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Order Status Control Bar */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', background: 'var(--admin-surface-secondary)', borderRadius: 'var(--admin-radius-lg)', border: '1px solid var(--admin-border-light)' }}>
                <div>
                  <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--admin-text-muted)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Order Status</p>
                  <p style={{ fontSize: '13px', color: 'var(--admin-text-secondary)', margin: '2px 0 0' }}>Changing to <strong>Completed</strong> updates customer stats & sends completion email.</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <select
                    value={currentStatus}
                    disabled={updatingStatus}
                    onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                    style={{ padding: '8px 14px', borderRadius: 'var(--admin-radius-lg)', border: '1px solid var(--admin-border)', background: 'var(--admin-surface)', color: 'var(--admin-text)', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                  >
                    <option value="PENDING">Pending</option>
                    <option value="PROCESSING">Processing</option>
                    <option value="SHIPPED">Shipped</option>
                    <option value="DELIVERED">Completed / Delivered</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Customer Info */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ padding: '16px', borderRadius: 'var(--admin-radius-lg)', border: '1px solid var(--admin-border-light)' }}>
                  <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--admin-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 8px' }}>Customer</p>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--admin-text)', margin: 0 }}>{custName}</p>
                  <p style={{ fontSize: '12px', color: 'var(--admin-text-secondary)', margin: '4px 0 0' }}>{custEmail}</p>
                  <p style={{ fontSize: '12px', color: 'var(--admin-text-secondary)', margin: '2px 0 0' }}>{custPhone}</p>
                </div>
                <div style={{ padding: '16px', borderRadius: 'var(--admin-radius-lg)', border: '1px solid var(--admin-border-light)' }}>
                  <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--admin-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 8px' }}>Shipping Address</p>
                  <p style={{ fontSize: '13px', color: 'var(--admin-text)', margin: 0 }}>{street}</p>
                  <p style={{ fontSize: '13px', color: 'var(--admin-text-secondary)', margin: '2px 0 0' }}>{city}{zip ? `, ${zip}` : ''}</p>
                </div>
              </div>

              {/* Items */}
              <div>
                <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--admin-text)', marginBottom: '12px' }}>Items ({items.length})</p>
                {items.map((item, idx) => {
                  const name = item.name || item.product_name || 'Product';
                  const qty = item.quantity || 1;
                  const price = item.price || item.unit_price || 0;
                  const itemTotal = item.total_price || (price * qty);
                  return (
                    <div key={item.id || idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: '1px solid var(--admin-border-light)' }}>
                      <div style={{ width: 44, height: 44, borderRadius: 'var(--admin-radius-md)', overflow: 'hidden', background: 'var(--admin-surface-secondary)', flexShrink: 0 }}>
                        <img src={item.image || PLACEHOLDER_IMAGE} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--admin-text)', margin: 0 }}>{name}</p>
                        <p style={{ fontSize: '12px', color: 'var(--admin-text-muted)', margin: 0 }}>Qty: {qty}</p>
                      </div>
                      <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--admin-text)' }}>{formatCurrency(itemTotal)}</p>
                    </div>
                  );
                })}
                <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '12px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '12px', color: 'var(--admin-text-muted)', margin: '4px 0' }}>Subtotal: {formatCurrency(subtotal)}</p>
                    <p style={{ fontSize: '12px', color: 'var(--admin-text-muted)', margin: '4px 0' }}>Shipping: {formatCurrency(shipping)}</p>
                    {discount > 0 && <p style={{ fontSize: '12px', color: 'var(--admin-success)', margin: '4px 0' }}>Discount: -{formatCurrency(discount)}</p>}
                    <p style={{ fontSize: '16px', fontWeight: 700, color: 'var(--admin-text)', margin: '8px 0 0' }}>Total: {formatCurrency(total)}</p>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div>
                <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--admin-text)', marginBottom: '12px' }}>Order Timeline</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                  {timeline.map((event, i) => {
                    const status = event.status || event.event_type || 'Event';
                    const note = event.note || event.description || '';
                    const date = event.date || event.created_at;
                    return (
                      <div key={i} style={{ display: 'flex', gap: '12px', paddingBottom: '16px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <div style={{ width: 10, height: 10, borderRadius: '50%', background: i === timeline.length - 1 ? 'var(--admin-primary)' : 'var(--admin-border)', border: i === timeline.length - 1 ? '3px solid var(--admin-primary-light)' : 'none', flexShrink: 0 }} />
                          {i < timeline.length - 1 && <div style={{ width: 2, flex: 1, background: 'var(--admin-border-light)', marginTop: 4 }} />}
                        </div>
                        <div>
                          <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--admin-text)', margin: 0, textTransform: 'capitalize' }}>{status}</p>
                          {note && <p style={{ fontSize: '12px', color: 'var(--admin-text-secondary)', margin: '2px 0' }}>{note}</p>}
                          <p style={{ fontSize: '11px', color: 'var(--admin-text-muted)' }}>{formatDate(date)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })()}
      </Modal>
    </PageContainer>
  );
}
