import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  HiOutlineShoppingBag, HiOutlineTag, HiOutlineUsers, HiOutlineClipboardDocumentList,
  HiOutlineCurrencyDollar, HiOutlineEnvelope, HiOutlineChatBubbleLeftRight,
  HiOutlineChartBar, HiOutlinePlus, HiOutlinePencilSquare, HiOutlineCog6Tooth,
  HiOutlineCheckCircle
} from 'react-icons/hi2';
import { useAdmin } from '../../contexts/AdminContext';
import { getDashboardStats, getRecentActivity, getNotifications } from '../../services/api';
import { formatCurrency, formatRelativeDate } from '../../utils/formatters';
import { PageContainer } from '../../components/ui/PageLayout';
import StatCard, { StatGrid } from '../../components/ui/StatCard';
import { ContentCard } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { CardSkeleton } from '../../components/ui/Skeleton';

export default function Dashboard() {
  const { currentUser } = useAdmin();
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [s, a, n] = await Promise.all([
          getDashboardStats().catch(() => null),
          getRecentActivity().catch(() => []),
          getNotifications().catch(() => [])
        ]);
        setStats(s || { totalProducts: 0, totalCategories: 0, totalCustomers: 0, totalOrders: 0, revenue: 0, pendingInquiries: 0, surveyResponses: 0, conversionRate: 0, revenueData: [], trafficSources: [], topProducts: [] });
        setActivity(a || []);
        setNotifications(n || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) {
    return (
      <PageContainer>
        <div style={{ marginBottom: 32 }}>
          <div className="admin-skeleton" style={{ width: 280, height: 28, borderRadius: 8, marginBottom: 8 }} />
          <div className="admin-skeleton" style={{ width: 200, height: 16, borderRadius: 6 }} />
        </div>
        <StatGrid>
          {[1,2,3,4,5,6].map(i => <CardSkeleton key={i} />)}
        </StatGrid>
      </PageContainer>
    );
  }

  if (!stats) {
    return (
      <PageContainer>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'var(--admin-surface)',
            borderRadius: 'var(--admin-radius-2xl)',
            padding: '64px 32px',
            textAlign: 'center',
            border: '1px dashed var(--admin-border)',
            marginTop: '20px'
          }}
        >
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'var(--admin-surface-secondary)', margin: '0 auto 24px',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <HiOutlineChartBar size={32} style={{ color: 'var(--admin-text-muted)' }} />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--admin-text)', marginBottom: '12px' }}>Dashboard Unavailable</h2>
          <p style={{ fontSize: '14px', color: 'var(--admin-text-secondary)', maxWidth: 500, margin: '0 auto 24px' }}>
            The backend analytics endpoint (/api/v1/admin/analytics/dashboard-stats/) is not yet implemented.
            Please complete the backend module to view store statistics.
          </p>
        </motion.div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* ─── Hero Welcome ─── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          background: 'linear-gradient(135deg, var(--admin-primary) 0%, #264a30 100%)',
          borderRadius: 'var(--admin-radius-2xl)',
          padding: '32px 36px',
          marginBottom: '28px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Pattern overlay */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.04,
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }} />
        {/* Gold accent */}
        <div style={{
          position: 'absolute', top: -40, right: -40,
          width: 200, height: 200, borderRadius: '50%',
          background: 'var(--admin-accent)',
          opacity: 0.08,
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', marginBottom: '4px', fontWeight: 500 }}>
            {greeting()},
          </p>
          <h1 style={{
            fontSize: '26px', fontWeight: 800, color: 'white',
            fontFamily: 'var(--admin-font-display)', margin: '0 0 8px 0',
            letterSpacing: '-0.02em',
          }}>
            {currentUser.name}
          </h1>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', margin: 0 }}>
            Here&apos;s what&apos;s happening with your store today.
          </p>
        </div>
      </motion.div>

      {/* ─── Stat Cards ─── */}
      <StatGrid columns={4}>
        <StatCard title="Total Products" value={stats.totalProducts} change={stats.productsChange || "+0%"} trend={String(stats.productsChange).startsWith('-') ? 'down' : 'up'} icon={HiOutlineShoppingBag} accentColor="var(--admin-primary)" index={0} />
        <StatCard title="Categories" value={stats.totalCategories} change={stats.categoriesChange || "+0%"} trend={String(stats.categoriesChange).startsWith('-') ? 'down' : 'up'} icon={HiOutlineTag} accentColor="#D4AF37" index={1} />
        <StatCard title="Customers" value={stats.totalCustomers} change={stats.customersChange || "+0%"} trend={String(stats.customersChange).startsWith('-') ? 'down' : 'up'} icon={HiOutlineUsers} accentColor="#059669" index={2} />
        <StatCard title="Orders" value={stats.totalOrders} change={stats.ordersChange || "+0%"} trend={String(stats.ordersChange).startsWith('-') ? 'down' : 'up'} icon={HiOutlineClipboardDocumentList} accentColor="#2563EB" index={3} />
        <StatCard title="Revenue" value={formatCurrency(stats.revenue)} change={stats.revenueChange || "+0%"} trend={String(stats.revenueChange).startsWith('-') ? 'down' : 'up'} icon={HiOutlineCurrencyDollar} accentColor="#059669" index={4} />
        <StatCard title="Pending Inquiries" value={stats.pendingInquiries} change="+0%" trend="up" icon={HiOutlineEnvelope} accentColor="#D97706" index={5} />
        <StatCard title="Survey Responses" value={stats.surveyResponses} change="+0%" trend="up" icon={HiOutlineChatBubbleLeftRight} accentColor="#7C3AED" index={6} />
        <StatCard title="Conversion Rate" value={`${stats.conversionRate}%`} change={stats.conversionRateChange || "+0%"} trend={String(stats.conversionRateChange).startsWith('-') ? 'down' : 'up'} icon={HiOutlineChartBar} accentColor="#DC2626" index={7} />
      </StatGrid>

      {/* ─── Charts Row ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginTop: '24px' }} className="admin-charts-row">
        <style>{`@media(max-width:900px){.admin-charts-row{grid-template-columns:1fr!important;}}`}</style>

        {/* Sales Chart */}
        <ContentCard title="Revenue Overview" subtitle="Monthly revenue trends">
          <ResponsiveContainer width="100%" height={280}>
            {stats && stats.revenueData && stats.revenueData.length > 0 ? (
              <AreaChart data={stats.revenueData}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1B3622" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#1B3622" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--admin-border-light)" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--admin-text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: 'var(--admin-text-muted)' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--admin-surface)', border: '1px solid var(--admin-border)',
                    borderRadius: 'var(--admin-radius-lg)', boxShadow: 'var(--admin-shadow-lg)',
                    fontSize: '13px',
                  }}
                  formatter={(value) => [formatCurrency(value), 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#1B3622" strokeWidth={2.5} fill="url(#revenueGradient)" />
              </AreaChart>
            ) : (
  <div style={{ 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    height: '280px', // Explicitly matches your ResponsiveContainer height
    padding: '0 24px', // Keeps text away from the card edges
    textAlign: 'center', 
    color: 'var(--admin-text-muted)',
    fontSize: '14px'
  }}>
    No revenue data available
  </div>
)}
          </ResponsiveContainer>
        </ContentCard>

        {/* Traffic Sources */}
        <ContentCard title="Traffic Sources" subtitle="Where visitors come from">
          <ResponsiveContainer width="100%" height={280}>
            {stats && stats.trafficSources && stats.trafficSources.length > 0 ? (
              <PieChart>
                <Pie
                  data={stats.trafficSources}
                  cx="50%" cy="50%"
                  innerRadius={65} outerRadius={95}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {stats.trafficSources.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color || '#ccc'} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: 'var(--admin-surface)', border: '1px solid var(--admin-border)',
                    borderRadius: 'var(--admin-radius-lg)', fontSize: '13px',
                  }}
                  formatter={(value) => [`${value}%`, 'Share']}
                />
                <Legend
                  verticalAlign="bottom"
                  formatter={(value) => <span style={{ fontSize: '11px', color: 'var(--admin-text-secondary)' }}>{value}</span>}
                />
              </PieChart>
            ) : (
  <div style={{ 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    height: '280px', // Matches your ResponsiveContainer height
    padding: '0 24px', 
    textAlign: 'center', 
    color: 'var(--admin-text-muted)',
    fontSize: '14px'
  }}>
    No traffic data available
  </div>
)}
          </ResponsiveContainer>
        </ContentCard>
      </div>

      {/* ─── Bottom Row ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginTop: '24px' }} className="admin-bottom-row">
        <style>{`@media(max-width:1100px){.admin-bottom-row{grid-template-columns:1fr 1fr!important;}}@media(max-width:700px){.admin-bottom-row{grid-template-columns:1fr!important;}}`}</style>

        {/* Recent Activity */}
        <ContentCard title="Recent Activity" subtitle="Latest updates">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {activity.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '10px 12px', borderRadius: 'var(--admin-radius-md)',
                  transition: 'background var(--admin-transition-fast)',
                  cursor: 'default',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--admin-surface-secondary)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: i === 0 ? 'var(--admin-success)' : 'var(--admin-border)',
                  boxShadow: i === 0 ? '0 0 8px rgba(5,150,105,0.3)' : 'none',
                  flexShrink: 0,
                }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '13px', color: 'var(--admin-text)', margin: 0, fontWeight: 500 }}>{item.message}</p>
                  <p style={{ fontSize: '11px', color: 'var(--admin-text-muted)', margin: '2px 0 0' }}>{item.time}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </ContentCard>

        {/* Best Selling Products */}
        <ContentCard title="Best Sellers" subtitle="Top performing products">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {stats && stats.topProducts && stats.topProducts.length > 0 ? (
              stats.topProducts.slice(0, 5).map((product, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '8px 0',
                    borderBottom: i < 4 ? '1px solid var(--admin-border-light)' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{
                      width: 24, height: 24, borderRadius: 'var(--admin-radius-sm)',
                      background: 'var(--admin-surface-secondary)', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', fontSize: '11px',
                      fontWeight: 700, color: 'var(--admin-text-muted)',
                    }}>
                      {i + 1}
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--admin-text)' }}>{product.name}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--admin-text)', margin: 0 }}>{formatCurrency(product.revenue)}</p>
                    <p style={{ fontSize: '11px', color: 'var(--admin-text-muted)', margin: 0 }}>{product.sales} sold</p>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--admin-text-muted)' }}>No best sellers data yet</div>
            )}
          </div>
        </ContentCard>

        {/* Quick Actions */}
        <ContentCard title="Quick Actions" subtitle="Common shortcuts">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {[
              { label: 'Add Product', icon: HiOutlinePlus, path: '/admin/products/create', color: 'var(--admin-primary)' },
              { label: 'View Orders', icon: HiOutlineClipboardDocumentList, path: '/admin/orders', color: '#2563EB' },

              { label: 'Analytics', icon: HiOutlineChartBar, path: '/admin/analytics', color: '#059669' },
              { label: 'Write Blog', icon: HiOutlinePencilSquare, path: '/admin/cms/blogs', color: '#D97706' },
              { label: 'Settings', icon: HiOutlineCog6Tooth, path: '/admin/settings', color: '#6B7280' },
            ].map((action) => (
              <Link
                key={action.label}
                to={action.path}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                  padding: '16px 12px', borderRadius: 'var(--admin-radius-lg)',
                  border: '1px solid var(--admin-border-light)',
                  textDecoration: 'none', color: 'var(--admin-text)',
                  transition: 'all var(--admin-transition-fast)',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = action.color; e.currentTarget.style.background = 'var(--admin-surface-secondary)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--admin-border-light)'; e.currentTarget.style.background = 'transparent'; }}
              >
                <action.icon size={20} style={{ color: action.color }} />
                <span style={{ fontSize: '11px', fontWeight: 600, textAlign: 'center' }}>{action.label}</span>
              </Link>
            ))}
          </div>
        </ContentCard>
      </div>

      {/* ─── Notifications ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px', marginTop: '24px' }} className="admin-charts-row">
        {/* Recent Notifications */}
        <ContentCard
          title="Notifications"
          action={<Link to="/admin/notifications" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--admin-primary)', textDecoration: 'none' }}>View All</Link>}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {notifications && notifications.length > 0 ? (
              notifications.slice(0, 5).map((notif) => (
                <div
                  key={notif.id}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: '12px',
                    padding: '10px 12px', borderRadius: 'var(--admin-radius-md)',
                    background: !notif.read ? 'var(--admin-primary-50)' : 'transparent',
                  }}
                >
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%', marginTop: 5, flexShrink: 0,
                    background: !notif.read ? 'var(--admin-primary)' : 'var(--admin-border)',
                  }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '13px', fontWeight: !notif.read ? 600 : 400, color: 'var(--admin-text)', margin: 0 }}>{notif.title}</p>
                    <p style={{ fontSize: '12px', color: 'var(--admin-text-secondary)', margin: '2px 0 0' }}>{notif.message}</p>
                    <p style={{ fontSize: '11px', color: 'var(--admin-text-muted)', margin: '4px 0 0' }}>{formatRelativeDate(notif.createdAt)}</p>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--admin-text-muted)' }}>No new notifications</div>
            )}
          </div>
        </ContentCard>
      </div>
    </PageContainer>
  );
}
