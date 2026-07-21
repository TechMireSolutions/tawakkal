import { useState, useEffect } from 'react';
import { HiOutlineBell, HiOutlineCheckCircle, HiOutlineShoppingBag, HiOutlineCube, HiOutlineStar, HiOutlineServerStack, HiOutlineEnvelope, HiOutlineCreditCard, HiOutlineTrash } from 'react-icons/hi2';
import { motion } from 'framer-motion';
import { PageContainer, PageHeader } from '../../components/ui/PageLayout';
import { ContentCard } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import { getNotifications, markAllNotificationsRead } from '../../services/api';
import { formatRelativeDate } from '../../utils/formatters';

const typeIcons = { order: HiOutlineShoppingBag, stock: HiOutlineCube, review: HiOutlineStar, system: HiOutlineServerStack, message: HiOutlineEnvelope, payment: HiOutlineCreditCard };
const typeColors = { order: '#2563EB', stock: '#D97706', review: '#D4AF37', system: '#6B7280', message: '#059669', payment: '#7C3AED' };

export default function NotificationCenter() {
  const toast = useToast();
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => { getNotifications().then(n => { setNotifications(n); }); }, []);

  const filtered = filter === 'all' ? notifications : filter === 'unread' ? notifications.filter(n => !n.read) : notifications.filter(n => n.read);
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead();
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    toast.success('All notifications marked as read');
  };

  return (
    <PageContainer>
      <PageHeader title="Notifications" subtitle={`${unreadCount} unread notifications`} breadcrumbs={[{ label: 'Notifications' }]}
        secondaryAction={
          <div style={{ display: 'flex', gap: '10px' }}>
            <Button variant="danger" size="sm" icon={HiOutlineTrash} onClick={() => { if(window.confirm('Clear all notifications?')) { setNotifications([]); toast.success('Cleared all'); } }}>Clear All</Button>
            {unreadCount > 0 ? <Button variant="secondary" size="sm" icon={HiOutlineCheckCircle} onClick={handleMarkAllRead}>Mark All Read</Button> : null}
          </div>
        } />

      <ContentCard noPadding>
        <div style={{ display: 'flex', gap: '4px', padding: '16px 20px', borderBottom: '1px solid var(--admin-border-light)' }}>
          {[{ label: 'All', value: 'all' }, { label: `Unread (${unreadCount})`, value: 'unread' }, { label: 'Read', value: 'read' }].map(f => (
            <button key={f.value} onClick={() => setFilter(f.value)} style={{
              padding: '6px 14px', borderRadius: 'var(--admin-radius-full)', border: 'none', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
              background: filter === f.value ? 'var(--admin-primary)' : 'var(--admin-surface-secondary)', color: filter === f.value ? 'white' : 'var(--admin-text-secondary)',
              fontFamily: 'var(--admin-font-sans)',
            }}>{f.label}</button>
          ))}
        </div>
        <div>
          {filtered.map((notif, i) => {
            const Icon = typeIcons[notif.type] || HiOutlineBell;
            const color = typeColors[notif.type] || 'var(--admin-text-muted)';
            return (
              <motion.div key={notif.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: '14px', padding: '16px 20px',
                  borderBottom: '1px solid var(--admin-border-light)',
                  background: !notif.read ? 'var(--admin-primary-50)' : 'transparent',
                  transition: 'background var(--admin-transition-fast)',
                }}>
                <div style={{ width: 36, height: 36, borderRadius: 'var(--admin-radius-md)', background: `${color}15`, color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                  <Icon size={18} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <p style={{ fontSize: '14px', fontWeight: !notif.read ? 600 : 400, color: 'var(--admin-text)', margin: 0 }}>{notif.title}</p>
                    {!notif.read && <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--admin-primary)', flexShrink: 0, marginTop: 6 }} />}
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--admin-text-secondary)', margin: '4px 0 0', lineHeight: 1.5 }}>{notif.message}</p>
                  <p style={{ fontSize: '11px', color: 'var(--admin-text-muted)', margin: '6px 0 0' }}>{formatRelativeDate(notif.createdAt)}</p>
                </div>
              </motion.div>
            );
          })}
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--admin-text-muted)' }}>
              <HiOutlineBell size={32} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
              <p style={{ fontSize: '14px', margin: 0 }}>No notifications</p>
            </div>
          )}
        </div>
      </ContentCard>
    </PageContainer>
  );
}
