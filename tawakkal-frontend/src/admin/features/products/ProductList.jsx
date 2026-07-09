import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HiOutlinePlus, HiOutlineMagnifyingGlass,
  HiOutlinePencilSquare, HiOutlineTrash, HiOutlineEye,
  HiOutlineSquares2X2, HiOutlineListBullet, HiOutlineArrowDownTray,
} from 'react-icons/hi2';
import { PLACEHOLDER_IMAGE } from '../../utils/constants';
import { PageContainer, PageHeader } from '../../components/ui/PageLayout';
import { ContentCard } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import Pagination from '../../components/ui/Pagination';
import Dialog from '../../components/ui/Dialog';
import { EmptyState, NoSearchResults } from '../../components/ui/EmptyState';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { useToast } from '../../components/ui/Toast';
import { getProducts, deleteProduct } from '../../services/api';
import { formatCurrency } from '../../utils/formatters';
import { PRODUCT_STATUSES } from '../../utils/constants';

const PAGE_SIZE = 8;

export default function ProductList() {
  const navigate = useNavigate();
  const toast = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('list');
  const [deleteDialog, setDeleteDialog] = useState({ open: false, product: null });

  const loadProducts = async () => {
    try {
      const res = await getProducts();
      const rawData = Array.isArray(res) ? res : (res?.results || []);
      setProducts(rawData.map(p => ({ ...p, status: p.status?.toLowerCase() })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadProducts();
  }, []);

  const filtered = useMemo(() => {
    let data = [...products];
    if (search) {
      const q = search.toLowerCase();
      data = data.filter((p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q));
    }
    if (statusFilter) {
      data = data.filter((p) => p.status === statusFilter);
    }
    return data;
  }, [products, search, statusFilter]);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, currentPage]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  const handleDelete = async () => {
    try {
      await deleteProduct(deleteDialog.product.id);
      toast.success('Product deleted', `"${deleteDialog.product.name}" has been removed.`);
      setDeleteDialog({ open: false, product: null });
      loadProducts();
    } catch {
      toast.error('Error', 'Failed to delete product.');
    }
  };

  const getStatusBadge = (status) => {
    const config = PRODUCT_STATUSES[status] || PRODUCT_STATUSES.draft;
    return <Badge variant={config.color} dot>{config.label}</Badge>;
  };

  return (
    <PageContainer>
      <PageHeader
        title="Products"
        subtitle={`${products.length} products in your catalog`}
        breadcrumbs={[{ label: 'Products' }]}
        actionLabel="Add Product"
        actionIcon={HiOutlinePlus}
        onAction={() => navigate('/admin/products/create')}
        secondaryAction={
          <Button variant="secondary" icon={HiOutlineArrowDownTray} size="sm">
            Export
          </Button>
        }
      />

      <ContentCard noPadding>
        {/* Toolbar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px', gap: '12px', flexWrap: 'wrap',
          borderBottom: '1px solid var(--admin-border-light)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
            <Input
              placeholder="Search products..."
              icon={HiOutlineMagnifyingGlass}
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              size="sm"
              containerClassName="admin-product-search"
            />
            <style>{`.admin-product-search{max-width:300px;}`}</style>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              style={{
                height: '36px', padding: '0 12px', fontSize: '13px', fontWeight: 500,
                border: '1px solid var(--admin-border)', borderRadius: 'var(--admin-radius-lg)',
                background: 'var(--admin-surface)', color: 'var(--admin-text)',
                fontFamily: 'var(--admin-font-sans)', cursor: 'pointer',
              }}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button
              onClick={() => setViewMode('list')}
              style={{
                width: 36, height: 36, borderRadius: 'var(--admin-radius-md)',
                border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: viewMode === 'list' ? 'var(--admin-primary-light)' : 'transparent',
                color: viewMode === 'list' ? 'var(--admin-primary)' : 'var(--admin-text-muted)',
              }}
              aria-label="List view"
            >
              <HiOutlineListBullet size={18} />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              style={{
                width: 36, height: 36, borderRadius: 'var(--admin-radius-md)',
                border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: viewMode === 'grid' ? 'var(--admin-primary-light)' : 'transparent',
                color: viewMode === 'grid' ? 'var(--admin-primary)' : 'var(--admin-text-muted)',
              }}
              aria-label="Grid view"
            >
              <HiOutlineSquares2X2 size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <TableSkeleton rows={6} columns={6} />
        ) : filtered.length === 0 ? (
          search ? <NoSearchResults query={search} /> :
          <EmptyState title="No products yet" message="Start by adding your first product." actionLabel="Add Product" onAction={() => navigate('/admin/products/create')} />
        ) : viewMode === 'list' ? (
          /* ── Table View ── */
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table" style={{ minWidth: '900px' }}>
              <thead>
                <tr>
                  <th style={{ width: 40 }}><input type="checkbox" className="admin-checkbox" /></th>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'center' }}>Stock</th>
                  <th style={{ textAlign: 'right' }}>Price</th>
                  <th style={{ textAlign: 'right', width: 120 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((product) => (
                  <tr key={product.id}>
                    <td><input type="checkbox" className="admin-checkbox" /></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: 48, height: 48, borderRadius: 'var(--admin-radius-md)',
                          overflow: 'hidden', border: '1px solid var(--admin-border-light)',
                          flexShrink: 0, background: 'var(--admin-surface-secondary)',
                        }}>
                          <img src={product.primary_image?.image_url || product.primary_image?.image || product.primary_image?.file || product.primary_image?.url || PLACEHOLDER_IMAGE} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div>
                          <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--admin-text)', margin: 0 }}>{product.name}</p>
                          <p style={{ fontSize: '12px', color: 'var(--admin-text-muted)', margin: '2px 0 0' }}>SKU: {product.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: '13px', color: 'var(--admin-text-secondary)' }}>{product.category.name}</td>
                    <td>{getStatusBadge(product.status)}</td>
                    <td style={{ textAlign: 'center', fontSize: '13px', fontWeight: 600, color: product.stock <= product.lowStockThreshold ? 'var(--admin-danger)' : 'var(--admin-text)' }}>
                      {product.stock}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--admin-text)', margin: 0 }}>{formatCurrency(product.base_price)}</p>
                      {product.compare_at_price > product.base_price && (
                        <p style={{ fontSize: '11px', color: 'var(--admin-text-muted)', textDecoration: 'line-through', margin: '2px 0 0' }}>{formatCurrency(product.compare_at_price)}</p>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                        <button
                          onClick={() => navigate(`/admin/products/${product.id}`)}
                          title="View"
                          style={{
                            width: 32, height: 32, borderRadius: 'var(--admin-radius-md)', border: 'none',
                            background: 'transparent', color: 'var(--admin-text-muted)', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all var(--admin-transition-fast)',
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--admin-surface-secondary)'; e.currentTarget.style.color = 'var(--admin-primary)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--admin-text-muted)'; }}
                        >
                          <HiOutlineEye size={16} />
                        </button>
                        <button
                          onClick={() => navigate(`/admin/products/${product.id}/edit`)}
                          title="Edit"
                          style={{
                            width: 32, height: 32, borderRadius: 'var(--admin-radius-md)', border: 'none',
                            background: 'transparent', color: 'var(--admin-text-muted)', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all var(--admin-transition-fast)',
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--admin-info-light)'; e.currentTarget.style.color = 'var(--admin-info)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--admin-text-muted)'; }}
                        >
                          <HiOutlinePencilSquare size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteDialog({ open: true, product })}
                          title="Delete"
                          style={{
                            width: 32, height: 32, borderRadius: 'var(--admin-radius-md)', border: 'none',
                            background: 'transparent', color: 'var(--admin-text-muted)', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all var(--admin-transition-fast)',
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--admin-danger-light)'; e.currentTarget.style.color = 'var(--admin-danger)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--admin-text-muted)'; }}
                        >
                          <HiOutlineTrash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* ── Grid View ── */
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: '16px', padding: '20px',
          }}>
            {paginated.map((product) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                  borderRadius: 'var(--admin-radius-xl)',
                  border: '1px solid var(--admin-border-light)',
                  overflow: 'hidden', cursor: 'pointer',
                  transition: 'all var(--admin-transition-fast)',
                }}
                onClick={() => navigate(`/admin/products/${product.id}`)}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = 'var(--admin-shadow-md)'; e.currentTarget.style.borderColor = 'var(--admin-border)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'var(--admin-border-light)'; }}
              >
                <div style={{ aspectRatio: '4/3', background: 'var(--admin-surface-secondary)', overflow: 'hidden' }}>
                  <img src={product.primary_image?.image_url || product.primary_image?.image || product.primary_image?.file || product.primary_image?.url || PLACEHOLDER_IMAGE} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ padding: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--admin-text)', margin: 0, flex: 1 }}>{product.name}</p>
                    {getStatusBadge(product.status)}
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--admin-text-muted)', margin: '0 0 8px' }}>{product.category.name}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ fontSize: '16px', fontWeight: 700, color: 'var(--admin-text)', margin: 0 }}>{formatCurrency(product.base_price)}</p>
                    <span style={{ fontSize: '12px', color: product.stock > 0 ? 'var(--admin-success)' : 'var(--admin-danger)', fontWeight: 500 }}>
                      {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {filtered.length > PAGE_SIZE && (
          <div style={{ padding: '0 20px' }}>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filtered.length}
              pageSize={PAGE_SIZE}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </ContentCard>

      {/* Delete confirmation */}
      <Dialog
        isOpen={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, product: null })}
        onConfirm={handleDelete}
        title="Delete Product"
        message={`Are you sure you want to delete "${deleteDialog.product?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
      />
    </PageContainer>
  );
}
