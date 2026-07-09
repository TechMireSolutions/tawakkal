import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageContainer, PageHeader, ActionBar } from '../../../components/ui/PageLayout';
import Button from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import Input from '../../../components/ui/Input';
import RichTextEditor from '../../../components/ui/RichTextEditor';
import ImageUploader from '../../../components/ui/ImageUploader';
import { useToast } from '../../../components/ui/Toast';
import { getBlog, createBlog, updateBlog, getBlogCategories, getAuthors } from '../../../services/cms.service';

export default function BlogForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const toast = useToast();

  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [categories, setCategories] = useState([]);
  const [authors, setAuthors] = useState([]);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    category: '',
    author: '',
    featured_image: '',
    status: 'draft',
    seo_title: '',
    seo_description: '',
  });

  useEffect(() => {
    // Load categories and authors
    Promise.all([
      getBlogCategories().catch(() => []),
      getAuthors().catch(() => [])
    ]).then(([cats, auths]) => {
      setCategories(cats);
      setAuthors(auths);
    });

    if (isEdit) {
      getBlog(id)
        .then(data => {
          setFormData({
            title: data.title || '',
            slug: data.slug || '',
            content: data.content || '',
            category: data.category || '',
            author: data.author || '',
            featured_image: data.featured_image || '',
            status: data.status || 'draft',
            seo_title: data.seo_title || '',
            seo_description: data.seo_description || '',
          });
        })
        .catch(() => {
          toast.error('Error', 'Failed to load blog post');
          navigate('/admin/cms/blogs');
        })
        .finally(() => setLoading(false));
    }
  }, [id, navigate, isEdit, toast]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isEdit) {
        await updateBlog(id, formData);
        toast.success('Success', 'Blog post updated successfully');
        navigate('/admin/cms/blogs');
      } else {
        await createBlog(formData);
        toast.success('Success', 'Blog post created successfully');
        navigate('/admin/cms/blogs');
      }
    } catch (err) {
      if (err.response?.data?.errors?.slug) {
        setErrors({ slug: err.response.data.errors.slug[0] || 'Invalid slug' });
      } else {
        toast.error('Error', 'Failed to save blog post');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <PageContainer><div style={{ padding: '24px', textAlign: 'center' }}>Loading...</div></PageContainer>;
  }

  return (
    <PageContainer>
      <form onSubmit={handleSubmit}>
        <PageHeader 
          title={isEdit ? "Edit Blog Post" : "Add Blog Post"} 
          breadcrumbs={[
            { label: 'CMS', path: '/admin/cms' },
            { label: 'Blog', path: '/admin/cms/blogs' },
            { label: isEdit ? 'Edit' : 'Create' }
          ]}
        />

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <Card title="Blog Details">
              <Input 
                label="Title" 
                value={formData.title} 
                onChange={(e) => handleChange('title', e.target.value)} 
                required 
              />
              <Input 
                label="Slug (optional)" 
                value={formData.slug} 
                onChange={(e) => handleChange('slug', e.target.value)} 
                error={errors.slug}
                hint="Leave empty to auto-generate from title"
              />
              {errors.slug && <p style={{ color: 'var(--admin-danger)', fontSize: '13px', marginTop: '-15px', marginBottom: '10px' }}>{errors.slug}</p>}
              <div style={{ marginTop: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--admin-text)', marginBottom: '8px' }}>Content</label>
                <RichTextEditor 
                  value={formData.content} 
                  onChange={(val) => handleChange('content', val)} 
                />
              </div>
            </Card>
            
            <Card title="SEO Settings">
              <Input 
                label="SEO Title" 
                value={formData.seo_title} 
                onChange={(e) => handleChange('seo_title', e.target.value)} 
              />
              <Input 
                label="SEO Description" 
                as="textarea"
                rows={4}
                value={formData.seo_description} 
                onChange={(e) => handleChange('seo_description', e.target.value)} 
              />
            </Card>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <Card title="Visibility">
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--admin-text)', marginBottom: '8px' }}>Status</label>
                <select 
                  className="admin-input" 
                  value={formData.status} 
                  onChange={(e) => handleChange('status', e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--admin-radius-md)', border: '1px solid var(--admin-border-light)' }}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </Card>

            <Card title="Organization">
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--admin-text)', marginBottom: '8px' }}>Category</label>
                <select 
                  className="admin-input" 
                  value={formData.category} 
                  onChange={(e) => handleChange('category', e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--admin-radius-md)', border: '1px solid var(--admin-border-light)' }}
                >
                  <option value="">Select Category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--admin-text)', marginBottom: '8px' }}>Author</label>
                <select 
                  className="admin-input" 
                  value={formData.author} 
                  onChange={(e) => handleChange('author', e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--admin-radius-md)', border: '1px solid var(--admin-border-light)' }}
                >
                  <option value="">Select Author</option>
                  {authors.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
            </Card>
            
            <Card title="Featured Image">
              <ImageUploader 
                value={formData.featured_image} 
                onChange={(uuid) => handleChange('featured_image', uuid)} 
              />
            </Card>
          </div>
        </div>
        
        <ActionBar>
          <Button variant="secondary" onClick={() => navigate('/admin/cms/blogs')} type="button">Cancel</Button>
          <Button type="submit" variant="primary" loading={submitting}>
            {isEdit ? 'Save Changes' : 'Create Post'}
          </Button>
        </ActionBar>
      </form>
    </PageContainer>
  );
}
