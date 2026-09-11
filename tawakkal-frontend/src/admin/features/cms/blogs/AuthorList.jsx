import { useState, useEffect, useCallback } from 'react';
import { PageContainer, PageHeader } from '../../../components/ui/PageLayout';
import { Card } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import Input from '../../../components/ui/Input';
import { useToast } from '../../../components/ui/Toast';
import { HiOutlinePlus, HiOutlinePencilSquare, HiOutlineTrash } from 'react-icons/hi2';
import { getAuthors, createAuthor, updateAuthor, deleteAuthor } from '../../../services/cms.service';

export default function AuthorList() {
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState({ isOpen: false });
  const [currentAuthor, setCurrentAuthor] = useState(null);
  const [formData, setFormData] = useState({ name: '', bio: '', status: 'published' });
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  const fetchAuthors = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAuthors();
      setAuthors(data);
    } catch {
      toast.error('Failed to load authors');
    } finally {
      setLoading(false);
    }
  }, [toast]);


  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      await Promise.resolve();
      if (isMounted) {
        await fetchAuthors();
      }
    };

    loadData();
    return () => {
      isMounted = false;
    };
  }, [fetchAuthors]);

  const handleOpenAdd = () => {
    setCurrentAuthor(null);
    setFormData({ name: '', bio: '', status: 'published' });
    setShowModal(true);
  };

  const handleOpenEdit = (author) => {
    setCurrentAuthor(author);
    setFormData({ name: author.name, bio: author.bio || '', status: author.status });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (currentAuthor) {
        await updateAuthor(currentAuthor.id, formData);
        toast.success('Author updated successfully');
      } else {
        await createAuthor(formData);
        toast.success('Author created successfully');
      }
      setShowModal(false);
      fetchAuthors();
    } catch {
      toast.error('Failed to save author');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    setConfirmConfig({
      isOpen: true,
      title: "Delete Author",
      message: 'Are you sure you want to delete this author?',
      onConfirm: async () => {
        try {
          await deleteAuthor(id);
          toast.success('Author deleted');
          fetchAuthors();
        } catch {
          toast.error('Failed to delete author');
        }
      }
    });
  };

  const handleDeleteAll = () => {
    setConfirmConfig({
      isOpen: true,
      title: "Delete All Authors",
      message: 'Are you sure you want to delete ALL authors? This action cannot be undone.',
      onConfirm: async () => {
        try {
          setLoading(true);
          for (const author of authors) {
            await deleteAuthor(author.id);
          }
          toast.success('All authors deleted');
          fetchAuthors();
        } catch {
          toast.error('Failed to delete some authors');
        } finally {
          setLoading(false);
        }
      }
    });
  };

  return (
    <PageContainer>
      <PageHeader
        title="Authors"
        breadcrumbs={[
          { label: 'CMS', path: '/admin/cms' },
          { label: 'Blogs', path: '/admin/cms/blogs' },
          { label: 'Authors' }
        ]}
        primaryAction={<Button variant="primary" icon={HiOutlinePlus} onClick={handleOpenAdd}>Add Author</Button>}
        secondaryAction={<Button variant="danger" icon={HiOutlineTrash} size="sm" onClick={handleDeleteAll}>Delete All</Button>}
      />

      <Card>
        {loading ? (
          <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--admin-border-light)', textAlign: 'left', color: 'var(--admin-text-muted)' }}>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Name</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, width: '100px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {authors.map(author => (
                <tr key={author.id} style={{ borderBottom: '1px solid var(--admin-border-light)' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 500 }}>{author.name}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 500,
                      background: author.status === 'published' ? 'var(--admin-success-bg)' : 'var(--admin-warning-bg)',
                      color: author.status === 'published' ? 'var(--admin-success)' : 'var(--admin-warning)'
                    }}>
                      {author.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', display: 'flex', gap: '8px' }}>
                    <button onClick={() => handleOpenEdit(author)} style={{ background: 'none', border: 'none', color: 'var(--admin-primary)', cursor: 'pointer' }}><HiOutlinePencilSquare size={18} /></button>
                    <button onClick={() => handleDelete(author.id)} style={{ background: 'none', border: 'none', color: 'var(--admin-danger)', cursor: 'pointer' }}><HiOutlineTrash size={18} /></button>
                  </td>
                </tr>
              ))}
              {authors.length === 0 && (
                <tr><td colSpan="3" style={{ padding: '24px', textAlign: 'center', color: 'var(--admin-text-muted)' }}>No authors found</td></tr>
              )}
            </tbody>
          </table>
        )}
      </Card>

      {showModal && (
        <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={currentAuthor ? 'Edit Author' : 'Add Author'}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Input label="Name" value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} required />
            <Input label="Bio" as="textarea" value={formData.bio} onChange={e => setFormData(p => ({ ...p, bio: e.target.value }))} style={{ minHeight: '80px' }} />
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Status</label>
              <select className="admin-input" value={formData.status} onChange={e => setFormData(p => ({ ...p, status: e.target.value }))} style={{ width: '100%', padding: '10px', borderRadius: 'var(--admin-radius-md)', border: '1px solid var(--admin-border)' }}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
              <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button variant="primary" type="submit" loading={submitting}>Save</Button>
            </div>
          </form>
        </Modal>
      )}

      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        message={confirmConfig.message}
        confirmText="Confirm"
        variant="danger"
      />
    </PageContainer>
  );
}
