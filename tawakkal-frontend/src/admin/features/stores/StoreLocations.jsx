import { useState, useEffect } from 'react';
import { HiOutlinePlus, HiOutlineMapPin, HiOutlinePhone, HiOutlineClock, HiOutlinePencilSquare, HiOutlineTrash } from 'react-icons/hi2';
import { PageContainer, PageHeader } from '../../components/ui/PageLayout';
import { Card } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import { useToast } from '../../components/ui/Toast';
import { EmptyState } from '../../components/ui/EmptyState';
import { CardSkeleton } from '../../components/ui/Skeleton';
import { getStores, createStore, updateStore, deleteStore } from '../../services/api';

export default function StoreLocations() {
  const toast = useToast();
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    code: '',
    city: 'Faisalabad',
    country: 'Pakistan',
    postal_code: '38000',
    state: 'Punjab',
  });
  const [editingStoreId, setEditingStoreId] = useState(null);

  const fetchStores = async () => {
    setLoading(true);
    try {
      const data = await getStores();
      setStores(data);
    } catch (err) {
      toast.error('Failed to load stores');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStores(); }, []);

  const handleSave = async () => {
    if (!formData.name || !formData.address) {
      toast.error('Name and address are required');
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        code: formData.code || formData.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        slug: formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      };
      
      if (editingStoreId) {
        await updateStore(editingStoreId, payload);
        toast.success('Store updated successfully');
      } else {
        await createStore(payload);
        toast.success('Store added');
      }
      
      setShowModal(false);
      setEditingStoreId(null);
      setFormData({ name: '', address: '', phone: '', code: '', city: 'Faisalabad', country: 'Pakistan', postal_code: '38000', state: 'Punjab' });
      fetchStores();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save store');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (store) => {
    setFormData({
      name: store.name || '',
      address: store.address || '',
      phone: store.phone || '',
      code: store.code || '',
      slug: store.slug || '',
      city: store.city || '',
      country: store.country || '',
      postal_code: store.postal_code || '',
      state: store.state || ''
    });
    setEditingStoreId(store.id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this store?')) {
      try {
        await deleteStore(id);
        toast.success('Store deleted');
        fetchStores();
      } catch (err) {
        toast.error('Failed to delete store');
      }
    }
  };

  const handleDeleteAll = async () => {
    if (confirm('Are you sure you want to delete ALL stores? This action cannot be undone.')) {
      try {
        setLoading(true);
        for (const store of stores) {
          await deleteStore(store.id);
        }
        toast.success('All stores deleted');
        fetchStores();
      } catch (err) {
        toast.error('Failed to delete some stores');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <PageContainer>
      <PageHeader title="Store Locations" subtitle={`${stores.length} stores`} breadcrumbs={[{ label: 'Stores' }]} actionLabel="Add Store" actionIcon={HiOutlinePlus} onAction={() => { setEditingStoreId(null); setFormData({ name: '', address: '', phone: '', code: '', city: 'Faisalabad', country: 'Pakistan', postal_code: '38000', state: 'Punjab' }); setShowModal(true); }} secondaryAction={<Button variant="danger" icon={HiOutlineTrash} size="sm" onClick={handleDeleteAll}>Delete All</Button>} />

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {[1,2,3].map(i => <CardSkeleton key={i} />)}
        </div>
      ) : stores.length === 0 ? (
        <EmptyState title="No stores yet" actionLabel="Add Store" onAction={() => setShowModal(true)} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {stores.map(store => (
            <Card key={store.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--admin-text)', margin: 0, fontFamily: 'var(--admin-font-display)' }}>{store.name}</h4>
                <Badge variant={store.status === 'ACTIVE' ? 'success' : 'neutral'} size="xs">{store.status === 'ACTIVE' ? 'Open' : 'Closed'}</Badge>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}><HiOutlineMapPin size={15} style={{ color: 'var(--admin-text-muted)', marginTop: 2, flexShrink: 0 }} /><span style={{ fontSize: '13px', color: 'var(--admin-text-secondary)' }}>{store.address}</span></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><HiOutlinePhone size={15} style={{ color: 'var(--admin-text-muted)' }} /><span style={{ fontSize: '13px', color: 'var(--admin-text-secondary)' }}>{store.phone}</span></div>
              </div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', borderTop: '1px solid var(--admin-border-light)', paddingTop: '12px' }}>
                <Button variant="ghost" size="xs" icon={HiOutlinePencilSquare} onClick={() => handleEditClick(store)}>Edit</Button>
                <Button variant="ghost" size="xs" icon={HiOutlineTrash} onClick={() => handleDelete(store.id)}>Delete</Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingStoreId ? "Edit Store" : "Add Store"} footer={<><Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button><Button onClick={handleSave} disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save'}</Button></>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input label="Store Name" placeholder="e.g. Tawakkal — Lahore" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
          <Input label="Address" placeholder="Full street address" required value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Input label="Phone" placeholder="+92 42 3571234" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
            <Input label="City" placeholder="Faisalabad" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} />
          </div>
        </div>
      </Modal>
    </PageContainer>
  );
}
