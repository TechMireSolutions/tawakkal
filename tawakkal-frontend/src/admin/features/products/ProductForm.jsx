import { useForm, FormProvider } from 'react-hook-form';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineArrowLeft } from 'react-icons/hi2';
import { PageContainer, PageHeader, ActionBar } from '../../components/ui/PageLayout';
import Button from '../../components/ui/Button';
import Tabs from '../../components/ui/Tabs';
import { useToast } from '../../components/ui/Toast';

import GeneralTab from './components/GeneralTab';
import MediaTab from './components/MediaTab';
import PricingTab from './components/PricingTab';
import InventoryTab from './components/InventoryTab';
import VariantsTab from './components/VariantsTab';
import SeoTab from './components/SeoTab';
import PublishingTab from './components/PublishingTab';
import WholesaleTab from './components/WholesaleTab';

export default function ProductForm({ title, subtitle, breadcrumbs, initialData, onSubmit, isSubmitting }) {
  const navigate = useNavigate();
  const toast = useToast();

    const methods = useForm({
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      category_id: '',
      brand: '',
      badges: [],
      base_price: '',
      compare_at_price: '',
      stock: 0,
      low_stock_threshold: 5,
      article_no: '',
      volume_no: '',
      shipping_price: '',
      seo_title: '',
      seo_description: '',
      seo_keywords: '',
      status: 'DRAFT',
      is_featured: false,
      wholesale_enabled: true,
      wholesale_price: '',
      wholesale_min_quantity: 6,
      wholesale_step_quantity: 6,
      media: [],
      variants: [],
      ...initialData
    }
  });

  const { handleSubmit, reset } = methods;

  useEffect(() => {
    if (initialData) {
      // Map badge objects back to IDs if they exist
      const dataToReset = { ...initialData };
      if (dataToReset.badges && dataToReset.badges.length > 0 && typeof dataToReset.badges[0] === 'object') {
          dataToReset.badges = dataToReset.badges.map(b => b.id);
      }
      reset(dataToReset);
    }
  }, [initialData, reset]);

  const handleFormSubmit = async (data) => {
    // Custom Validation
    if (!data.name || !data.category_id || !data.base_price || data.stock === undefined) {
      toast.error('Validation Error', 'Please fill in all required fields (Name, Category, Price, Stock).');
      return;
    }
    
    if (data.compare_at_price && parseFloat(data.compare_at_price) < parseFloat(data.base_price)) {
      toast.error('Validation Error', 'Compare at Price cannot be less than the Base Price.');
      return;
    }

    if (data.stock < 0) {
      toast.error('Validation Error', 'Stock cannot be negative.');
      return;
    }

    // Convert string prices to numbers to match schema
    const payload = {
      ...data,
      brand_id: data.brand || null,
      badge_ids: data.badges || [],
      base_price: parseFloat(data.base_price),
      compare_at_price: data.compare_at_price ? parseFloat(data.compare_at_price) : null,
      wholesale_price: data.wholesale_price ? parseFloat(data.wholesale_price) : null,
      wholesale_min_quantity: parseInt(data.wholesale_min_quantity || 6, 10),
      wholesale_step_quantity: parseInt(data.wholesale_step_quantity || 6, 10),
      stock: parseInt(data.stock, 10),
      low_stock_threshold: parseInt(data.low_stock_threshold || 5, 10),
      variants: data.variants.map(v => ({
        ...v,
        color_id: v.color_id && typeof v.color_id === 'string' && v.color_id.trim() ? v.color_id.trim() : null,
        size_id: v.size_id && typeof v.size_id === 'string' && v.size_id.trim() ? v.size_id.trim() : null,
        price_override: v.price_override ? parseFloat(v.price_override) : null,
        stock: parseInt(v.stock || 0, 10)
      })),
      media_ids: data.media.filter(m => m.status === 'success' && m.id).map(m => m.id)
    };

    try {
      await onSubmit(payload, methods.setError);
    } catch (err) {
      console.error(err);
    }
  };

  const tabs = [
    { label: 'General', content: <GeneralTab /> },
    { label: 'Media', content: <MediaTab /> },
    { label: 'Pricing', content: <PricingTab /> },
    { label: 'Wholesale', content: <WholesaleTab /> },
    { label: 'Inventory', content: <InventoryTab /> },
    { label: 'Variants', content: <VariantsTab /> },
    { label: 'SEO', content: <SeoTab /> },
    { label: 'Publishing', content: <PublishingTab /> },
  ];

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <PageContainer>
          <PageHeader
            title={title}
            subtitle={subtitle}
            breadcrumbs={breadcrumbs}
            secondaryAction={
              <Button variant="ghost" icon={HiOutlineArrowLeft} onClick={() => navigate('/admin/products')} size="sm" type="button">
                Back
              </Button>
            }
          />
          
          {/* We wrap Tabs here. Tabs content mounts inside FormProvider so state connects seamlessly */}
          <Tabs tabs={tabs} />
          
          <ActionBar>
            <Button variant="secondary" onClick={() => navigate('/admin/products')} type="button">Cancel</Button>
            <Button variant="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Product'}
            </Button>
          </ActionBar>
        </PageContainer>
      </form>
    </FormProvider>
  );
}
