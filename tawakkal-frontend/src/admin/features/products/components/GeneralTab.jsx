import { useFormContext, Controller } from 'react-hook-form';
import { FormSection } from '../../../components/ui/PageLayout';
import Input from '../../../components/ui/Input';
import RichTextEditor from '../../../components/ui/RichTextEditor';
import { useEffect, useState } from 'react';
import { fetchCategories } from '../../../../api';

export default function GeneralTab() {
  const { register, control, formState: { errors } } = useFormContext();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchCategories().then(setCategories).catch(console.error);
  }, []);

  return (
    <FormSection title="Basic Information" subtitle="Core product details">
      <Input 
        label="Product Name" 
        placeholder="e.g. Royal Silk Kurta" 
        required 
        {...register('name')}
        error={errors.name?.message}
      />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <Input 
          label="SKU" 
          placeholder="TWK-001" 
          {...register('sku')}
          error={errors.sku?.message}
        />
        <Input 
          label="Slug" 
          placeholder="royal-silk-kurta" 
          {...register('slug')}
          error={errors.slug?.message}
        />
      </div>
      <div>
        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--admin-text)', marginBottom: '6px' }}>Description</label>
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <RichTextEditor 
              value={field.value || ''} 
              onChange={field.onChange} 
              placeholder="Write a detailed product description..." 
            />
          )}
        />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--admin-text)', marginBottom: '6px' }}>Category *</label>
          {categories.length === 0 ? (
            <div style={{ padding: '10px 14px', fontSize: '14px', color: 'var(--admin-text-muted)', background: 'var(--admin-surface)', border: '1px solid var(--admin-border)', borderRadius: 'var(--admin-radius-lg)' }}>
              Loading categories...
            </div>
          ) : (
            <>
              <Controller
                name="category_id"
                control={control}
                render={({ field }) => (
                  <select 
                    style={{ width: '100%', height: '42px', padding: '0 14px', fontSize: '14px', border: `1px solid ${errors.category_id ? 'var(--admin-danger)' : 'var(--admin-border)'}`, borderRadius: 'var(--admin-radius-lg)', background: 'var(--admin-surface)', fontFamily: 'var(--admin-font-sans)', color: 'var(--admin-text)', outline: 'none' }}
                    {...field}
                    value={field.value || ""}
                  >
                    <option value="">Select Category</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                )}
              />
              {errors.category_id && <p style={{ fontSize: '12px', color: 'var(--admin-danger)', marginTop: '4px', fontWeight: 500 }}>{errors.category_id.message}</p>}
            </>
          )}
        </div>
        <Input 
          label="Brand" 
          placeholder="e.g. Tawakkal" 
          {...register('brand')}
          error={errors.brand?.message}
        />
      </div>
    </FormSection>
  );
}
