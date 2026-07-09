import { useState, useEffect } from 'react';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { HiOutlineArrowDownTray } from 'react-icons/hi2';
import { PageContainer, PageHeader } from '../../components/ui/PageLayout';
import { ContentCard } from '../../components/ui/Card';
import StatCard, { StatGrid } from '../../components/ui/StatCard';
import Button from '../../components/ui/Button';
import { PageSkeleton } from '../../components/ui/Skeleton';
import { getAnalyticsData } from '../../services/api';
import { formatCurrency, formatNumber } from '../../utils/formatters';
import { DATE_PRESETS } from '../../utils/constants';
import { HiOutlineCurrencyDollar, HiOutlineShoppingCart, HiOutlineUsers, HiOutlineArrowTrendingUp, HiOutlineChartBar } from 'react-icons/hi2';

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30d');

  useEffect(() => {
    (async () => { try { const res = await getAnalyticsData(period); setData(res); } finally { setLoading(false); } })();
  }, [period]);

  if (loading) return <PageSkeleton />;

  if (!data || !data.revenue) {
    return (
      <PageContainer>
        <PageHeader title="Analytics" subtitle="Business performance overview" breadcrumbs={[{ label: 'Analytics' }]} />
        <ContentCard>
          <div style={{ padding: '64px 32px', textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--admin-surface-secondary)', margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <HiOutlineChartBar size={32} style={{ color: 'var(--admin-text-muted)' }} />
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--admin-text)', marginBottom: '12px' }}>Analytics Unavailable</h2>
            <p style={{ fontSize: '14px', color: 'var(--admin-text-secondary)', maxWidth: 500, margin: '0 auto' }}>
              The backend analytics endpoints are not yet implemented.
              Please complete the backend module to view store statistics.
            </p>
          </div>
        </ContentCard>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader title="Analytics" subtitle="Business performance overview" breadcrumbs={[{ label: 'Analytics' }]}
        secondaryAction={
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <select value={period} onChange={(e) => setPeriod(e.target.value)} style={{ height: '36px', padding: '0 12px', fontSize: '13px', fontWeight: 500, border: '1px solid var(--admin-border)', borderRadius: 'var(--admin-radius-lg)', background: 'var(--admin-surface)', fontFamily: 'var(--admin-font-sans)', color: 'var(--admin-text)' }}>
              {DATE_PRESETS.filter(d => d.value !== 'custom').map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
            <Button variant="secondary" icon={HiOutlineArrowDownTray} size="sm">Export</Button>
          </div>
        }
      />

      <StatGrid columns={4}>
        <StatCard title="Total Revenue" value={formatCurrency(data.revenue.total)} change={`+${data.revenue.change}%`} trend="up" icon={HiOutlineCurrencyDollar} accentColor="var(--admin-primary)" index={0} changeLabel="vs last period" />
        <StatCard title="Total Orders" value={data.revenue.data.reduce((s, d) => s + d.orders, 0)} change="+15%" trend="up" icon={HiOutlineShoppingCart} accentColor="#2563EB" index={1} />
        <StatCard title="Total Visitors" value={formatNumber(data.visitors.total)} change="+18.5%" trend="up" icon={HiOutlineUsers} accentColor="#7C3AED" index={2} />
        <StatCard title="Conversion Rate" value={`${data.conversionRate}%`} change={`+${(data.conversionRate - data.previousConversionRate).toFixed(1)}%`} trend="up" icon={HiOutlineArrowTrendingUp} accentColor="#059669" index={3} />
      </StatGrid>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginTop: '24px' }} className="admin-charts-row">
        <style>{`@media(max-width:900px){.admin-charts-row{grid-template-columns:1fr!important;}}`}</style>
        <ContentCard title="Revenue Trend" subtitle="Monthly revenue performance">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data.revenue.data}>
              <defs><linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#1B3622" stopOpacity={0.15} /><stop offset="95%" stopColor="#1B3622" stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--admin-border-light)" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--admin-text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: 'var(--admin-text-muted)' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}K`} />
              <Tooltip contentStyle={{ background: 'var(--admin-surface)', border: '1px solid var(--admin-border)', borderRadius: 12, fontSize: 13 }} formatter={(v) => [formatCurrency(v), 'Revenue']} />
              <Area type="monotone" dataKey="revenue" stroke="#1B3622" strokeWidth={2.5} fill="url(#revGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </ContentCard>

        <ContentCard title="Traffic Sources">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={data.trafficSources} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                {data.trafficSources.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: 'var(--admin-surface)', border: '1px solid var(--admin-border)', borderRadius: 12, fontSize: 13 }} formatter={(v) => [`${v}%`]} />
              <Legend formatter={(v) => <span style={{ fontSize: 11, color: 'var(--admin-text-secondary)' }}>{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </ContentCard>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '24px' }} className="admin-charts-row">
        <ContentCard title="Top Products" subtitle="Best performing products">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {data.topProducts.map((p, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < data.topProducts.length - 1 ? '1px solid var(--admin-border-light)' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ width: 24, height: 24, borderRadius: 'var(--admin-radius-sm)', background: 'var(--admin-surface-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: 'var(--admin-text-muted)' }}>{i + 1}</span>
                  <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--admin-text)' }}>{p.name}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--admin-text)', margin: 0 }}>{formatCurrency(p.revenue)}</p>
                  <p style={{ fontSize: '11px', color: 'var(--admin-text-muted)', margin: 0 }}>{p.sales} units</p>
                </div>
              </div>
            ))}
          </div>
        </ContentCard>

        <ContentCard title="Visitors This Week">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data.visitors.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--admin-border-light)" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: 'var(--admin-text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: 'var(--admin-text-muted)' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'var(--admin-surface)', border: '1px solid var(--admin-border)', borderRadius: 12, fontSize: 13 }} />
              <Bar dataKey="visitors" fill="#D4AF37" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ContentCard>
      </div>
    </PageContainer>
  );
}
