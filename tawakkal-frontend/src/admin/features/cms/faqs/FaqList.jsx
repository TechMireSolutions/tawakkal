/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer, PageHeader } from '../../../components/ui/PageLayout';
import Button from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import { HiPlus, HiOutlinePencilSquare, HiOutlineTrash } from 'react-icons/hi2';
import { getFaqs, deleteFaq } from '../../../services/cms.service';
import { useToast } from '../../../components/ui/Toast';

export default function FaqList() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const toast = useToast();

  const loadFaqs = async () => {
    try {
      setLoading(true);
      const data = await getFaqs();
      setFaqs(data);
    } catch {
      toast.error('Error', 'Failed to load FAQs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFaqs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this FAQ?')) {
      try {
        await deleteFaq(id);
        toast.success('Success', 'FAQ deleted successfully');
        loadFaqs();
      } catch {
        toast.error('Error', 'Failed to delete FAQ');
      }
    }
  };

  const handleDeleteAll = async () => {
    if (window.confirm('Are you sure you want to delete ALL FAQs? This action cannot be undone.')) {
      try {
        setLoading(true);
        for (const faq of faqs) {
          await deleteFaq(faq.id);
        }
        toast.success('Success', 'All FAQs deleted');
        loadFaqs();
      } catch {
        toast.error('Error', 'Failed to delete some FAQs');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <PageContainer>
      <PageHeader 
        title="FAQs" 
        subtitle="Manage frequently asked questions" 
        breadcrumbs={[
          { label: 'CMS', path: '/admin/cms' },
          { label: 'FAQs' }
        ]}
        primaryAction={
          <Button variant="primary" icon={HiPlus} onClick={() => navigate('/admin/cms/faqs/create')}>
            Add FAQ
          </Button>
        }
        secondaryAction={<Button variant="danger" icon={HiOutlineTrash} size="sm" onClick={handleDeleteAll}>Delete All</Button>}
      />

      <Card>
        {loading ? (
          <div style={{ padding: '24px', textAlign: 'center' }}>Loading...</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Question</th>
                <th>Category</th>
                <th>Status</th>
                <th>Order</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {faqs.map(faq => (
                <tr key={faq.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--admin-text)', whiteSpace: 'normal', wordBreak: 'break-word', maxWidth: '500px' }}>{faq.question}</div>
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>{faq.category || '-'}</td>
                  <td>
                    <Badge variant={faq.status === 'published' ? 'success' : 'neutral'}>
                      {faq.status}
                    </Badge>
                  </td>
                  <td>{faq.sort_order}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Button variant="ghost" size="sm" icon={HiOutlinePencilSquare} onClick={() => navigate(`/admin/cms/faqs/${faq.id}`)} />
                      <Button variant="ghost" size="sm" icon={HiOutlineTrash} onClick={() => handleDelete(faq.id)} style={{ color: 'var(--admin-error)' }} />
                    </div>
                  </td>
                </tr>
              ))}
              {faqs.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '24px' }}>No FAQs found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </Card>
    </PageContainer>
  );
}
