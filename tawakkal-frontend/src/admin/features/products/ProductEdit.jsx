import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchProductDetail, updateProduct } from '../../../api';
import { useToast } from '../../components/ui/Toast';
import ProductForm from './ProductForm';

export default function ProductEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const res = await fetchProductDetail(id);
        if (res && res.id) {
          const product = res;
          
          // Map backend images to preview array for ImageUploader
          const initialPreviews = (product.images || []).map(img => ({
            id: img.media,
            url: img.image_url,
            status: 'success'
          }));

          setInitialData({
            ...product,
            category_id: product.category?.id || '',
            media: initialPreviews
          });
        } else {
          toast.error('Error', res?.message || 'Failed to load product');
          navigate('/admin/products');
        }
      } catch (error) {
        console.error("Fetch Product Error:", error);
        toast.error('Error', 'An unexpected error occurred while fetching.');
        navigate('/admin/products');
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      loadProduct();
    }
  }, [id, navigate, toast]);

  const handleSubmit = async (payload, setError) => {
    setIsSubmitting(true);
    try {
      const res = await updateProduct(id, payload);
      if (res && res.id) {
        toast.success('Product updated', 'Product has been updated successfully.');
        navigate('/admin/products');
      } else {
        throw new Error(res?.message || 'Failed to update product');
      }
    } catch (error) {
      console.error("Update Product Error:", error);
      let errMsg = error.message || 'An unexpected error occurred.';
      if (error.response?.data?.errors) {
        const errs = error.response.data.errors;
        errMsg = Object.entries(errs)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(' ') : v}`)
          .join('\n');
        if (errs.slug && setError) {
          setError('slug', { type: 'manual', message: errs.slug[0] || 'Invalid slug' });
        }
        return;
      } else if (error.response?.data?.message) {
        errMsg = error.response.data.message;
      }
      toast.error('Update Failed', errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '24px' }}>Loading product details...</div>;
  }

  return (
    <ProductForm
      title="Edit Product"
      subtitle={`Editing: ${initialData?.name}`}
      breadcrumbs={[{ label: 'Products', path: '/admin/products' }, { label: 'Edit' }]}
      initialData={initialData}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
    />
  );
}
