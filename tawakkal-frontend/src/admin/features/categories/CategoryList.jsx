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
import { getCategories, createCategory, deleteCategory, updateCategory } from '../../services/api';
import { uploadMedia } from '../../../api';

export default function CategoryList() {
  const toast = useToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, category: null });
  const [currentParentId, setCurrentParentId] = useState(null);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkNames, setBulkNames] = useState('');
  const [bulkSubmitting, setBulkSubmitting] = useState(false);
  
  const [newCat, setNewCat] = useState({ name: '', slug: '', brand: null, parent: null });
  const [newCatImage, setNewCatImage] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  
  const [showEditModal, setShowEditModal] = useState(false);
  const [editCat, setEditCat] = useState({ id: '', name: '', slug: '', description: '', parent: null, status: true, display_order: 0, seo_title: '', seo_description: '', seo_keywords: '', is_featured: false, brand: null });
  const [editCatImage, setEditCatImage] = useState(null);
  const [editSubmitting, setEditSubmitting] = useState(false);

  const [brands, setBrands] = useState([]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await getCategories();
      setCategories(data?.results || data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBrandsData = async () => {
    try {
      const { getBrands } = await import('../../services/api');
      const data = await getBrands();
      setBrands(data?.results || data);
    } catch(err) {
      console.error(err);
    }
  };

  useEffect(() => {
    let isMounted = true;
    if (isMounted) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchCategories();
      fetchBrandsData();
    }
    return () => { isMounted = false; };
  }, []);

  const handleSave = async () => {
    if (!newCat.name) {
      toast.error('Name is required');
      return;
    }
    
    // Check subcategory limit
    if (newCat.parent) {
      const parentCat = categories.find(c => c.id === newCat.parent);
      if (parentCat && parentCat.children_count >= 5) {
        alert('Maximum of 5 subcategories per parent category is allowed.');
        return;
      }
    }
    setSubmitting(true);
    try {
      let imageId = null;
      if (newCatImage) {
        const uploadRes = await uploadMedia(newCatImage, () => {});
        if (uploadRes && uploadRes.id) {
          imageId = uploadRes.id;
        }
      }

      await createCategory({
        name: newCat.name,
        slug: newCat.slug,
        brand: newCat.brand,
        parent: newCat.parent,
        image: imageId
      });
      
      toast.success('Category created successfully');
      setShowModal(false);
      setNewCat({ name: '', slug: '', brand: null, parent: null });
      setNewCatImage(null);
      fetchCategories();
    } catch (err) {
      console.error(err);
      if (err.response?.data?.errors?.slug) {
        setErrors({ slug: err.response.data.errors.slug[0] || 'Invalid slug' });
      } else {
        toast.error('Failed to create category');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (cat) => {
    setEditCat({
      id: cat.id,
      name: cat.name,
      slug: cat.slug || '',
      description: cat.description || '',
      parent: cat.parent_id || null,
      status: cat.status !== undefined ? cat.status : true,
      display_order: cat.display_order || 0,
      seo_title: cat.seo_title || '',
      seo_description: cat.seo_description || '',
      seo_keywords: cat.seo_keywords || '',
      is_featured: cat.is_featured || false,
      brand: cat.brand || null,
    });
    setEditCatImage(null);
    setShowEditModal(true);
  };

  const handleEditSave = async () => {
    if (!editCat.name) {
      toast.error('Name is required');
      return;
    }
    setEditSubmitting(true);
    try {
      let imageId = undefined;
      if (editCatImage) {
        const uploadRes = await uploadMedia(editCatImage, () => {});
        if (uploadRes && uploadRes.id) {
          imageId = uploadRes.id;
        }
      }

      const payload = {
        name: editCat.name,
        slug: editCat.slug,
        description: editCat.description,
        status: editCat.status,
        display_order: editCat.display_order,
        seo_title: editCat.seo_title,
        seo_description: editCat.seo_description,
        seo_keywords: editCat.seo_keywords,
        is_featured: editCat.is_featured,
        parent: editCat.parent,
        brand: editCat.brand,
      };
      
      if (imageId) payload.image = imageId;

      await updateCategory(editCat.id, payload);
      
      toast.success('Category updated successfully');
      setShowEditModal(false);
      fetchCategories();
    } catch (err) {
      console.error(err);
      if (err.response?.data?.errors?.slug) {
        setErrors({ slug: err.response.data.errors.slug[0] || 'Invalid slug' });
      } else {
        toast.error('Failed to update category');
      }
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleDelete = async () => {
    const cat = deleteDialog.category;
    if (!cat) return;
    try {
      await deleteCategory(cat.id);
      toast.success('Category deleted successfully');
      setDeleteDialog({ open: false, category: null });
      fetchCategories();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete category');
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm('Are you sure you want to delete ALL categories? This action cannot be undone.')) return;
    try {
      setLoading(true);
      const { api } = await import('../../services/api');
      await api.post('/catalog/categories/bulk_delete/', { ids: categories.map(c => c.id) });
      toast.success('All categories have been deleted');
      fetchCategories();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete some categories');
    } finally {
      setLoading(false);
    }
  };


    const currentParent = categories.find(c => c.id === currentParentId);
  const minLevel = categories.length > 0 ? Math.min(...categories.map(c => c.level)) : 0;
  
  let displayedCategories = categories;
  if (currentParent) {
    displayedCategories = categories.filter(c => c.level === currentParent.level + 1 && c.path.startsWith(currentParent.path));
  } else {
    displayedCategories = categories.filter(c => c.level === minLevel);
  }

  const filtered = search 
    ? categories.filter(c => c.name.toLowerCase().includes(search.toLowerCase())) 
    : displayedCategories;

  return (
    <PageContainer>
      <PageHeader 
        title={currentParent ? currentParent.name : "Categories"} 
        subtitle={`${filtered.length} categories`} 
        breadcrumbs={
          currentParent 
            ? [
                { label: 'Categories', onClick: () => setCurrentParentId(null), style: { cursor: 'pointer', color: 'var(--admin-primary)' } }, 
                { label: currentParent.name }
              ] 
            : [{ label: 'Categories' }]
        } 
        actionLabel="Add Category" 
        actionIcon={HiOutlinePlus} 
        onAction={() => { setNewCat({ name: '', slug: '', brand: null, parent: currentParentId }); setShowModal(true); }} 
        secondaryAction={
          <div style={{ display: 'flex', gap: '8px' }}>
            {currentParent && (
              <Button variant="secondary" icon={HiOutlinePlus} size="sm" onClick={() => setShowBulkModal(true)}>
                Bulk Add Subcategories
              </Button>
            )}
            <Button variant="danger" icon={HiOutlineTrash} size="sm" onClick={handleDeleteAll}>Delete All</Button>
          </div>
        }
      />

      <div style={{ marginBottom: '20px', maxWidth: '340px' }}>
        <Input 
          placeholder="Search categories..." 
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
        <EmptyState title="No categories found" actionLabel="Add Category" onAction={() => setShowModal(true)} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
          {filtered.map(cat => (
                        <Card key={cat.id} style={{ cursor: 'pointer', transition: 'shadow 0.2s', ...((!currentParent && cat.children_count > 0) ? { borderLeft: '4px solid var(--admin-primary)' } : {}) }} onClick={() => setCurrentParentId(cat.id)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                {cat.image_url ? (
                  <div style={{ width: 48, height: 48, borderRadius: 'var(--admin-radius-lg)', overflow: 'hidden', flexShrink: 0 }}>
                    <img src={cat.image_url || PLACEHOLDER_IMAGE} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ) : (
                  <div style={{ width: 48, height: 48, borderRadius: 'var(--admin-radius-lg)', background: 'var(--admin-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--admin-primary)', fontWeight: 800, fontSize: '18px', fontFamily: 'var(--admin-font-display)' }}>
                    {cat.name.charAt(0)}
                  </div>
                )}
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--admin-text)', margin: 0 }}>{cat.name}</h4>
                  <p style={{ fontSize: '12px', color: 'var(--admin-text-muted)', margin: '2px 0 0' }}>{cat.children_count || 0} subcategories</p>
                </div>
                <Badge variant={cat.status ? 'success' : 'neutral'} size="xs">{cat.status ? 'Active' : 'Draft'}</Badge>
              </div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <Button variant="secondary" size="xs" onClick={(e) => { e.stopPropagation(); setNewCat({ name: '', slug: '', brand: null, parent: cat.id }); setShowModal(true); }}>Add Sub</Button>
                <Button variant="ghost" size="xs" icon={HiOutlinePencilSquare} onClick={(e) => { e.stopPropagation(); openEditModal(cat); }}>Edit</Button>
                <Button variant="ghost" size="xs" icon={HiOutlineTrash} onClick={(e) => { e.stopPropagation(); setDeleteDialog({ open: true, category: cat }); }}>Delete</Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        title="Add Category" 
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
            label="Category Name" 
            placeholder="e.g. Living Room" 
            value={newCat.name} 
            onChange={(e) => { setNewCat(p => ({...p, name: e.target.value})); if(errors.slug) setErrors({}); }}
            required
          />
          <Input 
            label="Slug (optional)" 
            placeholder="e.g. living-room" 
            value={newCat.slug} 
            onChange={(e) => { setNewCat(p => ({...p, slug: e.target.value})); if(errors.slug) setErrors({}); }}
            error={errors.slug}
          />
          {errors.slug && <p style={{ color: 'var(--admin-danger)', fontSize: '13px', marginTop: '-12px', marginBottom: '8px' }}>{errors.slug}</p>}
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--admin-text)', marginBottom: '8px' }}>Brand (Optional)</label>
            <select 
                style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--admin-border)', borderRadius: 'var(--admin-radius-md)', outline: 'none', background: '#fff' }}
                value={newCat.brand || ''} 
                onChange={e => setNewCat({...newCat, brand: e.target.value || null})}
            >
                <option value="">None</option>
                {brands.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                ))}
            </select>
          </div>
          
        </div>
      </Modal>

      <Modal 
        isOpen={showEditModal} 
        onClose={() => setShowEditModal(false)} 
        title="Edit Category" 
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
              value={editCat.name} 
              onChange={(e) => { setEditCat(p => ({...p, name: e.target.value})); if(errors.slug) setErrors({}); }}
            />
            <Input 
              label="Slug" 
              value={editCat.slug} 
              onChange={(e) => { setEditCat(p => ({...p, slug: e.target.value})); if(errors.slug) setErrors({}); }}
              error={errors.slug}
            />
            {errors.slug && <p style={{ color: 'var(--admin-danger)', fontSize: '13px', marginTop: '-12px', marginBottom: '8px' }}>{errors.slug}</p>}  </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--admin-text)', marginBottom: '8px' }}>Parent Category (Optional)</label>
              <select 
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--admin-border)', borderRadius: 'var(--admin-radius-md)', outline: 'none', background: '#fff' }}
                  value={editCat.parent || ''} 
                  onChange={e => setEditCat({...editCat, parent: e.target.value || null})}
              >
                  <option value="">None</option>
                  {categories.filter(c => c.id !== editCat.id).map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--admin-text)', marginBottom: '8px' }}>Brand (Optional)</label>
              <select 
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--admin-border)', borderRadius: 'var(--admin-radius-md)', outline: 'none', background: '#fff' }}
                  value={editCat.brand || ''} 
                  onChange={e => setEditCat({...editCat, brand: e.target.value || null})}
              >
                  <option value="">None</option>
                  {brands.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
              </select>
            </div>
          </div>
          <Input label="Description" as="textarea" rows={3} value={editCat.description} onChange={e => setEditCat({...editCat, description: e.target.value})} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
             <Input label="Display Order" type="number" value={editCat.display_order} onChange={e => setEditCat({...editCat, display_order: parseInt(e.target.value) || 0})} />
             <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--admin-text)', marginBottom: '8px' }}>Status</label>
                <select 
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--admin-border)', borderRadius: 'var(--admin-radius-md)', outline: 'none', background: '#fff' }}
                    value={editCat.status ? 'true' : 'false'} 
                    onChange={e => setEditCat({...editCat, status: e.target.value === 'true'})}
                >
                    <option value="true">Active</option>
                    <option value="false">Draft</option>
                </select>
             </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
             <input type="checkbox" id="is_featured" checked={editCat.is_featured} onChange={e => setEditCat({...editCat, is_featured: e.target.checked})} />
             <label htmlFor="is_featured" style={{ fontSize: '14px', color: 'var(--admin-text)' }}>Featured Category</label>
          </div>
          <div style={{ borderTop: '1px solid var(--admin-border)', paddingTop: '16px', marginTop: '8px' }}>
             <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>SEO Settings</h4>
             <Input label="SEO Title" value={editCat.seo_title} onChange={e => setEditCat({...editCat, seo_title: e.target.value})} />
             <div style={{ marginTop: '12px' }}><Input label="SEO Keywords" value={editCat.seo_keywords} onChange={e => setEditCat({...editCat, seo_keywords: e.target.value})} /></div>
             <div style={{ marginTop: '12px' }}><Input label="SEO Description" as="textarea" rows={2} value={editCat.seo_description} onChange={e => setEditCat({...editCat, seo_description: e.target.value})} /></div>
          </div>
          
        </div>
      </Modal>

      <Dialog 
        isOpen={deleteDialog.open} 
        onClose={() => setDeleteDialog({ open: false, category: null })} 
        onConfirm={handleDelete} 
        title="Delete Category" 
        message={`Delete "${deleteDialog.category?.name}"? Products in this category won't be deleted.`} 
        variant="danger" 
        confirmLabel="Delete" 
      />
    </PageContainer>
  );
}
