import { useState, useEffect } from 'react';
import { HiOutlineDocumentText, HiOutlinePencilSquare, HiOutlineNewspaper, HiOutlineQuestionMarkCircle } from 'react-icons/hi2';
import { PLACEHOLDER_IMAGE } from '../../utils/constants';
import { Link } from 'react-router-dom';
import { PageContainer, PageHeader } from '../../components/ui/PageLayout';
import { Card, ContentCard } from '../../components/ui/Card';
import { StatGrid } from '../../components/ui/StatCard';
import Badge from '../../components/ui/Badge';
import { getBlogs, getFaqs } from '../../services/api';

export default function CMSDashboard() {
  const [blogs, setBlogs] = useState([]);
  const [faqs, setFaqs] = useState([]);
  useEffect(() => { getBlogs().then(setBlogs); getFaqs().then(setFaqs); }, []);

  const sections = [
    { title: 'Static Pages', icon: HiOutlineDocumentText, path: '/admin/cms/pages', count: 6, desc: 'Homepage, About, Policies' },
    { title: 'Blog Posts', icon: HiOutlineNewspaper, path: '/admin/cms/blogs', count: blogs.length, desc: `${blogs.filter(b=>b.status==='published').length} published` },
    { title: 'FAQs', icon: HiOutlineQuestionMarkCircle, path: '/admin/cms/faqs', count: faqs.length, desc: 'Customer questions' },
  ];

  return (
    <PageContainer>
      <PageHeader title="Content Management" subtitle="Manage your website content" breadcrumbs={[{ label: 'CMS' }]} />

      <StatGrid columns={3}>
        {sections.map((s) => (
          <Link key={s.title} to={s.path} style={{ textDecoration: 'none' }}>
            <Card hover>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: 48, height: 48, borderRadius: 'var(--admin-radius-lg)', background: 'var(--admin-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--admin-primary)' }}>
                  <s.icon size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--admin-text)', margin: 0, fontFamily: 'var(--admin-font-display)' }}>{s.title}</h3>
                  <p style={{ fontSize: '12px', color: 'var(--admin-text-muted)', margin: '4px 0 0' }}>{s.count} items · {s.desc}</p>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </StatGrid>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '24px' }} className="admin-charts-row">
        <ContentCard title="Recent Blog Posts" action={<Link to="/admin/cms/blogs" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--admin-primary)', textDecoration: 'none' }}>View All</Link>}>
          {blogs.map(blog => (
            <div key={blog.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: '1px solid var(--admin-border-light)' }}>
              <div style={{ width: 48, height: 36, borderRadius: 'var(--admin-radius-sm)', overflow: 'hidden', flexShrink: 0 }}><img src={blog.featuredImage || PLACEHOLDER_IMAGE} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--admin-text)', margin: 0 }}>{blog.title}</p>
                <p style={{ fontSize: '11px', color: 'var(--admin-text-muted)', margin: '2px 0 0' }}>{blog.author} · {blog.views} views</p>
              </div>
              <Badge variant={blog.status === 'published' ? 'success' : 'neutral'} size="xs">{blog.status}</Badge>
            </div>
          ))}
        </ContentCard>

        <ContentCard title="Quick Edit Sections" subtitle="Click to edit website content">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {['Homepage Hero', 'About Section', 'Privacy Policy', 'Shipping Policy', 'Disclaimer', 'Footer Content', 'Contact Info', 'Newsletter'].map(section => (
              <div key={section} style={{ padding: '14px', borderRadius: 'var(--admin-radius-lg)', border: '1px solid var(--admin-border-light)', cursor: 'pointer', transition: 'all var(--admin-transition-fast)', display: 'flex', alignItems: 'center', gap: '8px' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--admin-primary)'; e.currentTarget.style.background = 'var(--admin-primary-50)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--admin-border-light)'; e.currentTarget.style.background = 'transparent'; }}>
                <HiOutlinePencilSquare size={14} style={{ color: 'var(--admin-text-muted)' }} />
                <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--admin-text)' }}>{section}</span>
              </div>
            ))}
          </div>
        </ContentCard>
      </div>
    </PageContainer>
  );
}
