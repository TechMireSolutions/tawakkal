import { useFormContext, Controller } from 'react-hook-form';
import { FormSection } from '../../../components/ui/PageLayout';
import Input from '../../../components/ui/Input';
import RichTextEditor from '../../../components/ui/RichTextEditor';
import { useEffect, useState } from 'react';
import { getCategories, getBrands, getBadges } from '../../../services/api';

export default function GeneralTab() {
  const { register, control, formState: { errors } } = useFormContext();
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [badges, setBadges] = useState([]);

  useEffect(() => {
    getCategories().then(res => setCategories(res?.results || res)).catch(console.error);
    getBrands().then(res => setBrands(res?.results || res)).catch(console.error);
    getBadges().then(res => setBadges(res?.results || res)).catch(console.error);
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
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--admin-text)', marginBottom: '6px' }}>Brand</label>
          <Controller
            name="brand"
            control={control}
            render={({ field }) => (
              <select 
                style={{ width: '100%', height: '42px', padding: '0 14px', fontSize: '14px', border: `1px solid ${errors.brand ? 'var(--admin-danger)' : 'var(--admin-border)'}`, borderRadius: 'var(--admin-radius-lg)', background: 'var(--admin-surface)', fontFamily: 'var(--admin-font-sans)', color: 'var(--admin-text)', outline: 'none' }}
                {...field}
                value={field.value || ""}
              >
                <option value="">Select Brand (Optional)</option>
                {brands.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            )}
          />
          {errors.brand && <p style={{ fontSize: '12px', color: 'var(--admin-danger)', marginTop: '4px', fontWeight: 500 }}>{errors.brand.message}</p>}
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--admin-text)', marginBottom: '6px' }}>Category *</label>
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
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--admin-text)', marginBottom: '6px' }}>Badges</label>
          <Controller
            name="badges"
            control={control}
            render={({ field }) => (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '150px', overflowY: 'auto', padding: '8px', border: '1px solid var(--admin-border)', borderRadius: 'var(--admin-radius-lg)', background: 'var(--admin-surface)' }}>
                {badges.map(badge => (
                  <label key={badge.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--admin-text)' }}>
                    <input 
                      type="checkbox" 
                      checked={(field.value || []).includes(badge.id) || (field.value || []).some(b => b.id === badge.id)}
                      onChange={(e) => {
                        const currentVal = (field.value || []).map(b => typeof b === 'object' ? b.id : b);
                        if (e.target.checked) {
                          field.onChange([...currentVal, badge.id]);
                        } else {
                          field.onChange(currentVal.filter(id => id !== badge.id));
                        }
                      }}
                    />
                    {badge.name}
                  </label>
                ))}
                {badges.length === 0 && <span style={{ color: 'var(--admin-text-muted)', fontSize: '12px' }}>No badges available</span>}
              </div>
            )}
          />
        </div>
      </div>
    </FormSection>
  );
}
