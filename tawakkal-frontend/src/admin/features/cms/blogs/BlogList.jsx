/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer, PageHeader } from '../../../components/ui/PageLayout';
import Button from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import { HiPlus, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi2';
import { getBlogs, deleteBlog } from '../../../services/cms.service';
import { useToast } from '../../../components/ui/Toast';

export default function BlogList() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const toast = useToast();

  const loadBlogs = async () => {
    try {
      setLoading(true);
      const data = await getBlogs();
      setBlogs(data);
    } catch {
      toast.error('Error', 'Failed to load blogs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBlogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this blog post?')) {
      try {
        await deleteBlog(id);
        toast.success('Success', 'Blog post deleted successfully');
        loadBlogs();
      } catch {
        toast.error('Error', 'Failed to delete blog');
      }
    }
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Blog Posts" 
        subtitle="Manage your blog articles" 
        breadcrumbs={[
          { label: 'CMS', path: '/admin/cms' },
          { label: 'Blog Posts' }
        ]}
        primaryAction={
          <Button variant="primary" icon={HiPlus} onClick={() => navigate('/admin/cms/blogs/create')}>
            Add Post
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
                <th>Author</th>
                <th>Status</th>
                <th>Views</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {blogs.map(blog => (
                <tr key={blog.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--admin-text)' }}>{blog.title}</div>
                    <div style={{ fontSize: '12px', color: 'var(--admin-text-muted)' }}>/{blog.slug}</div>
                  </td>
                  <td>{blog.author || '-'}</td>
                  <td>
                    <Badge variant={blog.status === 'published' ? 'success' : 'neutral'}>
                      {blog.status}
                    </Badge>
                  </td>
                  <td>{blog.views}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Button variant="ghost" size="sm" icon={HiOutlinePencil} onClick={() => navigate(`/admin/cms/blogs/${blog.id}`)} />
                      <Button variant="ghost" size="sm" icon={HiOutlineTrash} onClick={() => handleDelete(blog.id)} style={{ color: 'var(--admin-error)' }} />
                    </div>
                  </td>
                </tr>
              ))}
              {blogs.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '24px' }}>No blog posts found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </Card>
    </PageContainer>
  );
}
