import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createProduct } from '../../services/api';
import { useToast } from '../../components/ui/Toast';
import ProductForm from './ProductForm';

export default function CreateProduct() {
  const navigate = useNavigate();
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (payload, setError) => {
    setIsSubmitting(true);
    try {
      const res = await createProduct(payload);
      if (res && res.id) {
        toast.success('Product created', 'New product has been saved successfully.');
        navigate('/admin/products');
      } else {
        throw new Error(res?.message || 'Failed to create product');
      }
    } catch (error) {
      console.error("Create Product Error:", error);
      
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
      
      toast.error('Creation Failed', errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProductForm
      title="Create Product"
      subtitle="Add a new product to your catalog"
      breadcrumbs={[{ label: 'Products', path: '/admin/products' }, { label: 'Create' }]}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
    />
  );
}
