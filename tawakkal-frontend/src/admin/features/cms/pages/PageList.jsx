/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer, PageHeader } from '../../../components/ui/PageLayout';
import Button from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import { HiPlus, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi2';
import { getPages, deletePage } from '../../../services/cms.service';
import { useToast } from '../../../components/ui/Toast';

export default function PageList() {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const toast = useToast();

  const loadPages = async () => {
    try {
      setLoading(true);
      const data = await getPages();
      setPages(data);
    } catch {
      toast.error('Error', 'Failed to load pages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this page?')) {
      try {
        await deletePage(id);
        toast.success('Success', 'Page deleted successfully');
        loadPages();
      } catch {
        toast.error('Error', 'Failed to delete page');
      }
    }
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Pages" 
        subtitle="Manage website pages" 
        breadcrumbs={[
          { label: 'CMS', path: '/admin/cms' },
          { label: 'Pages' }
        ]}
        primaryAction={
          <Button variant="primary" icon={HiPlus} onClick={() => navigate('/admin/cms/pages/create')}>
            Add Page
          </Button>
        }
      />

      <Card>
        {loading ? (
          <div style={{ padding: '24px', textAlign: 'center' }}>Loading...</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Group</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pages.map(page => (
                <tr key={page.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--admin-text)' }}>{page.title}</div>
                    <div style={{ fontSize: '12px', color: 'var(--admin-text-muted)' }}>/{page.slug}</div>
                  </td>
                  <td>{page.group || '-'}</td>
                  <td>
                    <Badge variant={page.status === 'published' ? 'success' : 'neutral'}>
                      {page.status}
                    </Badge>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Button variant="ghost" size="sm" icon={HiOutlinePencil} onClick={() => navigate(`/admin/cms/pages/${page.id}`)} />
                      <Button variant="ghost" size="sm" icon={HiOutlineTrash} onClick={() => handleDelete(page.id)} style={{ color: 'var(--admin-error)' }} />
                    </div>
                  </td>
                </tr>
              ))}
              {pages.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '24px' }}>No pages found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </Card>
    </PageContainer>
  );
}
