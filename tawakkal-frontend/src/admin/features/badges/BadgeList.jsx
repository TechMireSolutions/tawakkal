import { useState, useEffect } from 'react';
import { HiOutlinePlus, HiOutlineMagnifyingGlass, HiOutlinePencilSquare, HiOutlineTrash } from 'react-icons/hi2';
import { PLACEHOLDER_IMAGE } from '../../utils/constants';
import { PageContainer, PageHeader } from '../../components/ui/PageLayout';
import { Card } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Dialog from '../../components/ui/Dialog';
import { useToast } from '../../components/ui/Toast';
import { CardSkeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { getBadges, createBadge, deleteBadge, updateBadge } from '../../services/api';
import { uploadMedia } from '../../../api';

export default function BadgeList() {
  const toast = useToast();
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, badge: null });
  
  const [newBadge, setNewBadge] = useState({ name: '', slug: '', background_color: '', text_color: '' });
  const [newBadgeIcon, setNewBadgeIcon] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  
  const [showEditModal, setShowEditModal] = useState(false);
  const [editBadge, setEditBadge] = useState({ id: '', name: '', slug: '', background_color: '', text_color: '', status: true, display_order: 0, priority: 0 });
  const [editBadgeIcon, setEditBadgeIcon] = useState(null);
  const [editSubmitting, setEditSubmitting] = useState(false);

  const fetchBadges = async () => {
    try {
      setLoading(true);
      const data = await getBadges();
      setBadges(data?.results || data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    if (isMounted) {
      fetchBadges();
    }
    return () => { isMounted = false; };
  }, []);

  const handleSave = async () => {
    if (badges.length >= 5) {
      toast.error('Maximum of 5 badges allowed.');
      return;
    }
    if (!newBadge.name) {
      toast.error('Name is required');
      return;
    }
    setSubmitting(true);
    try {
      let iconId = null;
      if (newBadgeIcon) {
        const uploadRes = await uploadMedia(newBadgeIcon, () => {});
        if (uploadRes && uploadRes.id) {
          iconId = uploadRes.id;
        }
      }

      await createBadge({
        name: newBadge.name,
        slug: newBadge.slug,
        background_color: newBadge.background_color,
        text_color: newBadge.text_color,
        icon: iconId
      });
      
      toast.success('Badge created successfully');
      setShowModal(false);
      setNewBadge({ name: '', slug: '', background_color: '', text_color: '' });
      setNewBadgeIcon(null);
      fetchBadges();
    } catch (err) {
      console.error(err);
      if (err.response?.data?.errors?.slug) {
        setErrors({ slug: err.response.data.errors.slug[0] || 'Invalid slug' });
      } else {
        toast.error('Failed to create badge');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (badge) => {
    setEditBadge({
      id: badge.id,
      name: badge.name,
      slug: badge.slug || '',
      background_color: badge.background_color || '',
      text_color: badge.text_color || '',
      status: badge.status !== undefined ? badge.status : true,
      display_order: badge.display_order || 0,
      priority: badge.priority || 0,
    });
    setEditBadgeIcon(null);
    setShowEditModal(true);
  };

  const handleEditSave = async () => {
    if (!editBadge.name) {
      toast.error('Name is required');
      return;
    }
    setEditSubmitting(true);
    try {
      let iconId = undefined;
      if (editBadgeIcon) {
        const uploadRes = await uploadMedia(editBadgeIcon, () => {});
        if (uploadRes && uploadRes.id) {
          iconId = uploadRes.id;
        }
      }

      const payload = {
        name: editBadge.name,
        slug: editBadge.slug,
        background_color: editBadge.background_color,
        text_color: editBadge.text_color,
        status: editBadge.status,
        display_order: editBadge.display_order,
        priority: editBadge.priority,
      };
      
      if (iconId) payload.icon = iconId;

      await updateBadge(editBadge.id, payload);
      
      toast.success('Badge updated successfully');
      setShowEditModal(false);
      fetchBadges();
    } catch (err) {
      console.error(err);
      if (err.response?.data?.errors?.slug) {
        setErrors({ slug: err.response.data.errors.slug[0] || 'Invalid slug' });
      } else {
        toast.error('Failed to update badge');
      }
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleDelete = async () => {
    const badge = deleteDialog.badge;
    if (!badge) return;
    try {
      await deleteBadge(badge.id);
      toast.success('Badge deleted successfully');
      setDeleteDialog({ open: false, badge: null });
      fetchBadges();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete badge');
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm('Are you sure you want to delete ALL badges? This action cannot be undone.')) return;
    try {
      setLoading(true);
      for (const badge of badges) {
        await deleteBadge(badge.id);
      }
      toast.success('All badges have been deleted');
      fetchBadges();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete some badges');
    } finally {
      setLoading(false);
    }
  };


  const filtered = search ? badges.filter(b => b.name.toLowerCase().includes(search.toLowerCase())) : badges;

  return (
    <PageContainer>
      <PageHeader 
        title="Badges" 
        subtitle={`${badges.length} badges in your catalog`} 
        breadcrumbs={[{ label: 'Badges' }]} 
        actionLabel="Add Badge" 
        actionIcon={HiOutlinePlus} 
        onAction={() => {
          if (badges.length >= 5) {
            toast.error('Maximum of 5 badges allowed.');
            return;
          }
          setShowModal(true);
        }}
        secondaryAction={<Button variant="danger" icon={HiOutlineTrash} size="sm" onClick={handleDeleteAll}>Delete All</Button>}
      />

      <div style={{ marginBottom: '20px', maxWidth: '340px' }}>
        <Input 
          placeholder="Search badges..." 
          icon={HiOutlineMagnifyingGlass} 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
          size="sm" 
        />
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
          {[1,2,3,4,5,6].map(i => <CardSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState title="No badges found" actionLabel="Add Badge" onAction={() => {
          if (badges.length >= 5) {
            toast.error('Maximum of 5 badges allowed.');
            return;
          }
          setShowModal(true);
        }} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
          {filtered.map(badge => (
            <Card key={badge.id}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                {badge.icon_details && badge.icon_details.file ? (
                  <div style={{ width: 48, height: 48, borderRadius: 'var(--admin-radius-md)', overflow: 'hidden', flexShrink: 0 }}>
                    <img src={badge.icon_details.file || PLACEHOLDER_IMAGE} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  </div>
                ) : (
                  <div style={{ width: 48, height: 48, borderRadius: 'var(--admin-radius-md)', background: badge.background_color || 'var(--admin-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: badge.text_color || 'var(--admin-primary)', fontWeight: 800, fontSize: '18px', fontFamily: 'var(--admin-font-display)' }}>
                    {badge.name.charAt(0)}
                  </div>
                )}
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--admin-text)', margin: 0 }}>{badge.name}</h4>
                  <p style={{ fontSize: '12px', color: 'var(--admin-text-muted)', margin: '2px 0 0' }}>Priority: {badge.priority}</p>
                </div>
                <Badge variant={badge.status ? 'success' : 'neutral'} size="xs">{badge.status ? 'Active' : 'Inactive'}</Badge>
              </div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <Button variant="ghost" size="xs" icon={HiOutlinePencilSquare} onClick={() => openEditModal(badge)}>Edit</Button>
                <Button variant="ghost" size="xs" icon={HiOutlineTrash} onClick={() => setDeleteDialog({ open: true, badge: badge })}>Delete</Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        title="Add Badge" 
        size="sm" 
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowModal(false)} disabled={submitting}>Cancel</Button>
            <Button onClick={handleSave} disabled={submitting}>{submitting ? 'Saving...' : 'Save'}</Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input 
            label="Badge Name" 
            placeholder="e.g. New Arrival" 
            value={newBadge.name} 
            onChange={(e) => { setNewBadge(p => ({...p, name: e.target.value})); if(errors.slug) setErrors({}); }}
            required
          />
          <Input 
            label="Slug (optional)" 
            placeholder="e.g. new-arrival" 
            value={newBadge.slug} 
            onChange={(e) => { setNewBadge(p => ({...p, slug: e.target.value})); if(errors.slug) setErrors({}); }}
            error={errors.slug}
          />
          {errors.slug && <p style={{ color: 'var(--admin-danger)', fontSize: '13px', marginTop: '-12px', marginBottom: '8px' }}>{errors.slug}</p>}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Input 
              label="Background Color" 
              placeholder="e.g. #FF0000" 
              value={newBadge.background_color} 
              onChange={(e) => setNewBadge(p => ({...p, background_color: e.target.value}))}
            />
            <Input 
              label="Text Color" 
              placeholder="e.g. #FFFFFF" 
              value={newBadge.text_color} 
              onChange={(e) => setNewBadge(p => ({...p, text_color: e.target.value}))}
            />
          </div>
          
        </div>
      </Modal>

      <Modal 
        isOpen={showEditModal} 
        onClose={() => setShowEditModal(false)} 
        title="Edit Badge" 
        size="md" 
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowEditModal(false)} disabled={editSubmitting}>Cancel</Button>
            <Button onClick={handleEditSave} disabled={editSubmitting}>{editSubmitting ? 'Saving...' : 'Save Changes'}</Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Input 
              label="Name" 
              value={editBadge.name} 
              onChange={(e) => { setEditBadge(p => ({...p, name: e.target.value})); if(errors.slug) setErrors({}); }}
            />
            <Input 
              label="Slug" 
              value={editBadge.slug} 
              onChange={(e) => { setEditBadge(p => ({...p, slug: e.target.value})); if(errors.slug) setErrors({}); }}
              error={errors.slug}
            />
            {errors.slug && <p style={{ color: 'var(--admin-danger)', fontSize: '13px', marginTop: '-12px', marginBottom: '8px' }}>{errors.slug}</p>}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Input 
              label="Background Color" 
              placeholder="e.g. #FF0000" 
              value={editBadge.background_color} 
              onChange={(e) => setEditBadge(p => ({...p, background_color: e.target.value}))}
            />
            <Input 
              label="Text Color" 
              placeholder="e.g. #FFFFFF" 
              value={editBadge.text_color} 
              onChange={(e) => setEditBadge(p => ({...p, text_color: e.target.value}))}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
             <Input label="Priority" type="number" helpText="Higher renders first" value={editBadge.priority} onChange={e => setEditBadge({...editBadge, priority: parseInt(e.target.value) || 0})} />
             <Input label="Display Order" type="number" value={editBadge.display_order} onChange={e => setEditBadge({...editBadge, display_order: parseInt(e.target.value) || 0})} />
             <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--admin-text)', marginBottom: '8px' }}>Status</label>
                <select 
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--admin-border)', borderRadius: 'var(--admin-radius-md)', outline: 'none', background: '#fff' }}
                    value={editBadge.status ? 'true' : 'false'} 
                    onChange={e => setEditBadge({...editBadge, status: e.target.value === 'true'})}
                >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                </select>
             </div>
          </div>
          
        </div>
      </Modal>

      <Dialog 
        isOpen={deleteDialog.open} 
        onClose={() => setDeleteDialog({ open: false, badge: null })} 
        onConfirm={handleDelete} 
        title="Delete Badge" 
        message={`Delete "${deleteDialog.badge?.name}"? It will be removed from all products.`} 
        variant="danger" 
        confirmLabel="Delete" 
      />
    </PageContainer>
  );
}
