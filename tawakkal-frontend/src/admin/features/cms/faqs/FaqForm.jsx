import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageContainer, PageHeader, ActionBar } from '../../../components/ui/PageLayout';
import Button from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import Input from '../../../components/ui/Input';
import RichTextEditor from '../../../components/ui/RichTextEditor';
import { useToast } from '../../../components/ui/Toast';
import { getFaq, createFaq, updateFaq } from '../../../services/cms.service';

export default function FaqForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const toast = useToast();

  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: '',
    status: 'draft',
    sort_order: 0,
  });

  useEffect(() => {
    if (isEdit) {
      getFaq(id)
        .then(data => {
          setFormData({
            question: data.question || '',
            answer: data.answer || '',
            category: data.category || '',
            status: data.status || 'draft',
            sort_order: data.sort_order || 0,
          });
        })
        .catch(() => {
          toast.error('Error', 'Failed to load FAQ');
          navigate('/admin/cms/faqs');
        })
        .finally(() => setLoading(false));
    }
  }, [id, navigate, isEdit, toast]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isEdit) {
        await updateFaq(id, formData);
        toast.success('Success', 'FAQ updated successfully');
        navigate('/admin/cms/faqs');
      } else {
        await createFaq(formData);
        toast.success('Success', 'FAQ created successfully');
        navigate('/admin/cms/faqs');
      }
    } catch {
      toast.error('Error', 'Failed to save FAQ');
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
          title={isEdit ? "Edit FAQ" : "Add FAQ"} 
          breadcrumbs={[
            { label: 'CMS', path: '/admin/cms' },
            { label: 'FAQs', path: '/admin/cms/faqs' },
            { label: isEdit ? 'Edit' : 'Create' }
          ]}
        />

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <Card title="FAQ Content">
              <Input 
                label="Question" 
                value={formData.question} 
                onChange={(e) => handleChange('question', e.target.value)} 
                required 
              />
              <div style={{ marginTop: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--admin-text)', marginBottom: '8px' }}>Answer</label>
                <RichTextEditor 
                  value={formData.answer} 
                  onChange={(val) => handleChange('answer', val)} 
                />
              </div>
            </Card>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <Card title="Settings">
              <Input 
                label="Category" 
                value={formData.category} 
                onChange={(e) => handleChange('category', e.target.value)} 
                placeholder="e.g. Shipping, Returns"
              />
              <div style={{ marginTop: '16px', marginBottom: '16px' }}>
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
              <Input 
                label="Sort Order" 
                type="number"
                value={formData.sort_order} 
                onChange={(e) => handleChange('sort_order', parseInt(e.target.value) || 0)} 
              />
            </Card>
          </div>
        </div>
        
        <ActionBar>
          <Button variant="secondary" onClick={() => navigate('/admin/cms/faqs')} type="button">Cancel</Button>
          <Button type="submit" variant="primary" loading={submitting}>
            {isEdit ? 'Save Changes' : 'Create FAQ'}
          </Button>
        </ActionBar>
      </form>
    </PageContainer>
  );
}
