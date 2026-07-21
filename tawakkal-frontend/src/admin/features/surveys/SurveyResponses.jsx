import { useState, useEffect } from 'react';
import { HiOutlineStar, HiOutlineArrowDownTray, HiOutlineTrash } from 'react-icons/hi2';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PageContainer, PageHeader } from '../../components/ui/PageLayout';
import { ContentCard } from '../../components/ui/Card';
import StatCard, { StatGrid } from '../../components/ui/StatCard';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { getSurveys, getSurveyAnalytics } from '../../services/api';
import { formatDate } from '../../utils/formatters';
import { exportToPDF } from '../../utils/exportToPDF';

export default function SurveyResponses() {
  const [surveys, setSurveys] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => { Promise.all([getSurveys(), getSurveyAnalytics()]).then(([s, a]) => { setSurveys(s); setAnalytics(a); }); }, []);

  const ratingData = analytics ? Object.entries(analytics.distribution).map(([rating, count]) => ({ rating: `${rating}★`, count })).reverse() : [];

  const handleExport = () => {
    const headers = ['Customer', 'Rating', 'Feedback', 'Category', 'Date'];
    const data = surveys.map(s => [
      s.customer || 'Anonymous',
      `${s.rating} Stars`,
      s.feedback || '-',
      s.category || 'General',
      formatDate(s.createdAt)
    ]);
    exportToPDF('Survey Responses', 'survey_responses', headers, data);
  };

  return (
    <PageContainer>
      <PageHeader title="Survey Responses" subtitle={`${surveys.length} responses collected`} breadcrumbs={[{ label: 'Surveys' }]}
        secondaryAction={
          <div style={{ display: 'flex', gap: '10px' }}>
            <Button variant="danger" icon={HiOutlineTrash} size="sm" onClick={() => { if(window.confirm('Delete all survey responses?')) { setSurveys([]); } }}>Delete All</Button>
            <Button variant="secondary" icon={HiOutlineArrowDownTray} size="sm" onClick={handleExport}>Export</Button>
          </div>
        } />

      {analytics && (
        <StatGrid columns={3}>
          <StatCard title="Total Responses" value={analytics.totalResponses} icon={HiOutlineStar} accentColor="#D4AF37" index={0} />
          <StatCard title="Average Rating" value={analytics.averageRating.toFixed(1)} icon={HiOutlineStar} accentColor="#059669" index={1} />
          <StatCard title="5-Star Reviews" value={analytics.distribution[5]} icon={HiOutlineStar} accentColor="#1B3622" index={2} />
        </StatGrid>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '24px' }} className="admin-charts-row">
        <style>{`@media(max-width:900px){.admin-charts-row{grid-template-columns:1fr!important;}}`}</style>
        <ContentCard title="Rating Distribution">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={ratingData} layout="vertical"><CartesianGrid strokeDasharray="3 3" stroke="var(--admin-border-light)" /><XAxis type="number" tick={{ fontSize: 12 }} axisLine={false} /><YAxis type="category" dataKey="rating" tick={{ fontSize: 12 }} axisLine={false} width={40} /><Tooltip /><Bar dataKey="count" fill="#D4AF37" radius={[0, 6, 6, 0]} /></BarChart>
          </ResponsiveContainer>
        </ContentCard>

        <ContentCard title="Recent Feedback">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {surveys.slice(0, 4).map(s => (
              <div key={s.id} style={{ padding: '14px', borderRadius: 'var(--admin-radius-lg)', border: '1px solid var(--admin-border-light)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--admin-text)' }}>{s.customer}</span>
                  <div style={{ display: 'flex', gap: '2px' }}>{Array.from({ length: 5 }).map((_, i) => <HiOutlineStar key={i} size={14} style={{ color: i < s.rating ? '#D4AF37' : 'var(--admin-border)' }} />)}</div>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--admin-text-secondary)', margin: 0, lineHeight: 1.5 }}>{s.feedback}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                  <Badge variant="neutral" size="xs">{s.category}</Badge>
                  <span style={{ fontSize: '11px', color: 'var(--admin-text-muted)' }}>{formatDate(s.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        </ContentCard>
      </div>
    </PageContainer>
  );
}
