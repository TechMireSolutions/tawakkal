import { useState, useEffect } from 'react';
import { PageContainer, PageHeader } from '../../../components/ui/PageLayout';
import { Card } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { useToast } from '../../../components/ui/Toast';
import { HiOutlinePencil, HiOutlineTrash, HiOutlinePlus } from 'react-icons/hi2';
import { getBlogCategories, createBlogCategory, updateBlogCategory, deleteBlogCategory } from '../../../services/cms.service';

export default function BlogCategoryList() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [formData, setFormData] = useState({ name: '', slug: '', description: '', status: 'published' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await getBlogCategories();
      setCategories(data);
    } catch {
      toast.error('Failed to load blog categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenAdd = () => {
    setEditingCat(null);
    setFormData({ name: '', slug: '', description: '', status: 'published' });
    setErrors({});
    setShowModal(true);
  };

  const handleOpenEdit = (cat) => {
    setEditingCat(cat);
    setFormData({ name: cat.name, slug: cat.slug, description: cat.description || '', status: cat.status });
    setErrors({});
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingCat) {
        await updateBlogCategory(editingCat.id, formData);
        toast.success('Category updated successfully');
      } else {
        await createBlogCategory(formData);
        toast.success('Category created successfully');
      }
      setShowModal(false);
      fetchCategories();
    } catch (err) {
      if (err.response?.data?.errors?.slug) {
        setErrors({ slug: err.response.data.errors.slug[0] || 'Invalid slug' });
      } else {
        toast.error('Failed to save category');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await deleteBlogCategory(id);
        toast.success('Category deleted');
        fetchCategories();
      } catch {
        toast.error('Failed to delete category');
      }
    }
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Blog Categories" 
        breadcrumbs={[
          { label: 'CMS', path: '/admin/cms' },
          { label: 'Blogs', path: '/admin/cms/blogs' },
          { label: 'Categories' }
        ]}
        primaryAction={<Button variant="primary" icon={HiOutlinePlus} onClick={handleOpenAdd}>Add Category</Button>}
      />

      <Card>
        {loading ? (
          <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--admin-border-light)', textAlign: 'left', color: 'var(--admin-text-muted)' }}>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Name</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Slug</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, width: '100px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(cat => (
                <tr key={cat.id} style={{ borderBottom: '1px solid var(--admin-border-light)' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 500 }}>{cat.name}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--admin-text-muted)' }}>{cat.slug}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ 
                      padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 500,
                      background: cat.status === 'published' ? 'var(--admin-success-bg)' : 'var(--admin-warning-bg)',
                      color: cat.status === 'published' ? 'var(--admin-success)' : 'var(--admin-warning)'
                    }}>
                      {cat.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', display: 'flex', gap: '8px' }}>
                    <button onClick={() => handleOpenEdit(cat)} style={{ background: 'none', border: 'none', color: 'var(--admin-primary)', cursor: 'pointer' }}><HiOutlinePencil size={18} /></button>
                    <button onClick={() => handleDelete(cat.id)} style={{ background: 'none', border: 'none', color: 'var(--admin-danger)', cursor: 'pointer' }}><HiOutlineTrash size={18} /></button>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr><td colSpan="4" style={{ padding: '24px', textAlign: 'center', color: 'var(--admin-text-muted)' }}>No categories found</td></tr>
              )}
            </tbody>
          </table>
        )}
      </Card>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'var(--admin-surface)', borderRadius: 'var(--admin-radius-lg)', width: '400px', maxWidth: '90%', padding: '24px' }}>
            <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '18px' }}>{editingCat ? 'Edit Category' : 'Add Category'}</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <Input label="Name" value={formData.name} onChange={e => { setFormData(p => ({...p, name: e.target.value})); setErrors({}); }} required />
              <Input label="Slug (optional)" value={formData.slug} onChange={e => { setFormData(p => ({...p, slug: e.target.value})); setErrors({}); }} error={errors.slug} hint="Auto-generated if left empty" />
              {errors.slug && <p style={{ color: 'var(--admin-danger)', fontSize: '13px', marginTop: '-12px' }}>{errors.slug}</p>}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Status</label>
                <select className="admin-input" value={formData.status} onChange={e => setFormData(p => ({...p, status: e.target.value}))} style={{ width: '100%', padding: '10px', borderRadius: 'var(--admin-radius-md)', border: '1px solid var(--admin-border)' }}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button variant="primary" type="submit" loading={submitting}>Save</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
