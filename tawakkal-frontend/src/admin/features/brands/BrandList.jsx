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
import { getBrands, createBrand, deleteBrand, updateBrand } from '../../services/api';
import { uploadMedia } from '../../../api';

export default function BrandList() {
  const toast = useToast();
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, brand: null });
  
  const [newBrand, setNewBrand] = useState({ name: '', slug: '', description: '' });
  const [newBrandImage, setNewBrandImage] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  
  const [showEditModal, setShowEditModal] = useState(false);
  const [editBrand, setEditBrand] = useState({ id: '', name: '', slug: '', description: '', status: true, display_order: 0, seo_title: '', seo_description: '', seo_keywords: '', is_featured: false });
  const [editBrandImage, setEditBrandImage] = useState(null);
  const [editSubmitting, setEditSubmitting] = useState(false);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const data = await getBrands();
      // data might be wrapped depending on pagination
      setBrands(data?.results || data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    if (isMounted) {
      fetchBrands();
    }
    return () => { isMounted = false; };
  }, []);

  const handleSave = async () => {
    if (brands.length >= 10) {
      toast.error('Maximum of 10 brands allowed.');
      return;
    }
    if (!newBrand.name) {
      toast.error('Name is required');
      return;
    }
    setSubmitting(true);
    try {
      let imageId = null;
      if (newBrandImage) {
        const uploadRes = await uploadMedia(newBrandImage, () => {});
        if (uploadRes && uploadRes.id) {
          imageId = uploadRes.id;
        }
      }

      await createBrand({
        name: newBrand.name,
        slug: newBrand.slug,
        description: newBrand.description,
        logo: imageId
      });
      
      toast.success('Brand created successfully');
      setShowModal(false);
      setNewBrand({ name: '', slug: '', description: '' });
      setNewBrandImage(null);
      fetchBrands();
    } catch (err) {
      console.error(err);
      if (err.response?.data?.errors?.slug) {
        setErrors({ slug: err.response.data.errors.slug[0] || 'Invalid slug' });
      } else {
        toast.error('Failed to create brand');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (brand) => {
    setEditBrand({
      id: brand.id,
      name: brand.name,
      slug: brand.slug || '',
      description: brand.description || '',
      status: brand.status !== undefined ? brand.status : true,
      display_order: brand.display_order || 0,
      seo_title: brand.seo_title || '',
      seo_description: brand.seo_description || '',
      seo_keywords: brand.seo_keywords || '',
      is_featured: brand.is_featured || false,
    });
    setEditBrandImage(null);
    setShowEditModal(true);
  };

  const handleEditSave = async () => {
    if (!editBrand.name) {
      toast.error('Name is required');
      return;
    }
    setEditSubmitting(true);
    try {
      let imageId = undefined;
      if (editBrandImage) {
        const uploadRes = await uploadMedia(editBrandImage, () => {});
        if (uploadRes && uploadRes.id) {
          imageId = uploadRes.id;
        }
      }

      const payload = {
        name: editBrand.name,
        slug: editBrand.slug,
        description: editBrand.description,
        status: editBrand.status,
        display_order: editBrand.display_order,
        seo_title: editBrand.seo_title,
        seo_description: editBrand.seo_description,
        seo_keywords: editBrand.seo_keywords,
        is_featured: editBrand.is_featured,
      };
      
      if (imageId) payload.logo = imageId;

      await updateBrand(editBrand.id, payload);
      
      toast.success('Brand updated successfully');
      setShowEditModal(false);
      fetchBrands();
    } catch (err) {
      console.error(err);
      if (err.response?.data?.errors?.slug) {
        setErrors({ slug: err.response.data.errors.slug[0] || 'Invalid slug' });
      } else {
        toast.error('Failed to update brand');
      }
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleDelete = async () => {
    const brand = deleteDialog.brand;
    if (!brand) return;
    try {
      await deleteBrand(brand.id);
      toast.success('Brand deleted successfully');
      setDeleteDialog({ open: false, brand: null });
      fetchBrands();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete brand');
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm('Are you sure you want to delete ALL brands? This action cannot be undone.')) return;
    try {
      setLoading(true);
      for (const brand of brands) {
        await deleteBrand(brand.id);
      }
      toast.success('All brands have been deleted');
      fetchBrands();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete some brands');
    } finally {
      setLoading(false);
    }
  };


  const filtered = search ? brands.filter(b => b.name.toLowerCase().includes(search.toLowerCase())) : brands;

  return (
    <PageContainer>
      <PageHeader 
        title="Brands" 
        subtitle={`${brands.length} brands in your catalog`} 
        breadcrumbs={[{ label: 'Brands' }]} 
        actionLabel="Add Brand" 
        actionIcon={HiOutlinePlus} 
        onAction={() => {
          if (brands.length >= 10) {
            toast.error('Maximum of 10 brands allowed.');
            return;
          }
          setShowModal(true);
        }} 
        secondaryAction={<Button variant="danger" icon={HiOutlineTrash} size="sm" onClick={handleDeleteAll}>Delete All</Button>}
      />

      <div style={{ marginBottom: '20px', maxWidth: '340px' }}>
        <Input 
          placeholder="Search brands..." 
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
        <EmptyState title="No brands found" actionLabel="Add Brand" onAction={() => {
          if (brands.length >= 10) {
            toast.error('Maximum of 10 brands allowed.');
            return;
          }
          setShowModal(true);
        }} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
          {filtered.map(brand => (
            <Card key={brand.id}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                {brand.logo_details && brand.logo_details.file ? (
                  <div style={{ width: 48, height: 48, borderRadius: 'var(--admin-radius-lg)', overflow: 'hidden', flexShrink: 0 }}>
                    <img src={brand.logo_details.file || PLACEHOLDER_IMAGE} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ) : (
                  <div style={{ width: 48, height: 48, borderRadius: 'var(--admin-radius-lg)', background: 'var(--admin-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--admin-primary)', fontWeight: 800, fontSize: '18px', fontFamily: 'var(--admin-font-display)' }}>
                    {brand.name.charAt(0)}
                  </div>
                )}
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--admin-text)', margin: 0 }}>{brand.name}</h4>
                  <p style={{ fontSize: '12px', color: 'var(--admin-text-muted)', margin: '2px 0 0' }}>/{brand.slug}</p>
                </div>
                <Badge variant={brand.status ? 'success' : 'neutral'} size="xs">{brand.status ? 'Active' : 'Inactive'}</Badge>
              </div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <Button variant="ghost" size="xs" icon={HiOutlinePencilSquare} onClick={() => openEditModal(brand)}>Edit</Button>
                <Button variant="ghost" size="xs" icon={HiOutlineTrash} onClick={() => setDeleteDialog({ open: true, brand: brand })}>Delete</Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        title="Add Brand" 
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
            label="Brand Name" 
            placeholder="e.g. Khaadi" 
            value={newBrand.name} 
            onChange={(e) => { setNewBrand(p => ({...p, name: e.target.value})); if(errors.slug) setErrors({}); }}
            required
          />
          <Input 
            label="Slug (optional)" 
            placeholder="e.g. khaadi" 
            value={newBrand.slug} 
            onChange={(e) => { setNewBrand(p => ({...p, slug: e.target.value})); if(errors.slug) setErrors({}); }}
            error={errors.slug}
          />
          {errors.slug && <p style={{ color: 'var(--admin-danger)', fontSize: '13px', marginTop: '-12px', marginBottom: '8px' }}>{errors.slug}</p>}
          <Input 
            label="Description" 
            as="textarea"
            rows={2}
            value={newBrand.description} 
            onChange={(e) => setNewBrand(p => ({...p, description: e.target.value}))}
          />
          
        </div>
      </Modal>

      <Modal 
        isOpen={showEditModal} 
        onClose={() => setShowEditModal(false)} 
        title="Edit Brand" 
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
              value={editBrand.name} 
              onChange={(e) => { setEditBrand(p => ({...p, name: e.target.value})); if(errors.slug) setErrors({}); }}
            />
            <Input 
              label="Slug" 
              value={editBrand.slug} 
              onChange={(e) => { setEditBrand(p => ({...p, slug: e.target.value})); if(errors.slug) setErrors({}); }}
              error={errors.slug}
            />
            {errors.slug && <p style={{ color: 'var(--admin-danger)', fontSize: '13px', marginTop: '-12px', marginBottom: '8px' }}>{errors.slug}</p>}
          </div>
          <Input label="Description" as="textarea" rows={3} value={editBrand.description} onChange={e => setEditBrand({...editBrand, description: e.target.value})} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
             <Input label="Display Order" type="number" value={editBrand.display_order} onChange={e => setEditBrand({...editBrand, display_order: parseInt(e.target.value) || 0})} />
             <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--admin-text)', marginBottom: '8px' }}>Status</label>
                <select 
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--admin-border)', borderRadius: 'var(--admin-radius-md)', outline: 'none', background: '#fff' }}
                    value={editBrand.status ? 'true' : 'false'} 
                    onChange={e => setEditBrand({...editBrand, status: e.target.value === 'true'})}
                >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                </select>
             </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
             <input type="checkbox" id="is_featured" checked={editBrand.is_featured} onChange={e => setEditBrand({...editBrand, is_featured: e.target.checked})} />
             <label htmlFor="is_featured" style={{ fontSize: '14px', color: 'var(--admin-text)' }}>Featured Brand</label>
          </div>
          <div style={{ borderTop: '1px solid var(--admin-border)', paddingTop: '16px', marginTop: '8px' }}>
             <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>SEO Settings</h4>
             <Input label="SEO Title" value={editBrand.seo_title} onChange={e => setEditBrand({...editBrand, seo_title: e.target.value})} />
             <div style={{ marginTop: '12px' }}><Input label="SEO Keywords" value={editBrand.seo_keywords} onChange={e => setEditBrand({...editBrand, seo_keywords: e.target.value})} /></div>
             <div style={{ marginTop: '12px' }}><Input label="SEO Description" as="textarea" rows={2} value={editBrand.seo_description} onChange={e => setEditBrand({...editBrand, seo_description: e.target.value})} /></div>
          </div>
          
        </div>
      </Modal>

      <Dialog 
        isOpen={deleteDialog.open} 
        onClose={() => setDeleteDialog({ open: false, brand: null })} 
        onConfirm={handleDelete} 
        title="Delete Brand" 
        message={`Delete "${deleteDialog.brand?.name}"? Products belonging to this brand will not be deleted.`} 
        variant="danger" 
        confirmLabel="Delete" 
      />
    </PageContainer>
  );
}
