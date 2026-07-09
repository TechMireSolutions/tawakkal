import { useFormContext } from 'react-hook-form';
import { FormSection } from '../../../components/ui/PageLayout';

export default function PublishingTab() {
  const { register, formState: { errors } } = useFormContext();

  return (
    <FormSection title="Publishing Options" subtitle="Control product visibility">
      <div>
        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--admin-text)', marginBottom: '6px' }}>Status</label>
        <select 
          style={{ width: '100%', height: '42px', padding: '0 14px', fontSize: '14px', border: `1px solid ${errors.status ? 'var(--admin-danger)' : 'var(--admin-border)'}`, borderRadius: 'var(--admin-radius-lg)', background: 'var(--admin-surface)', fontFamily: 'var(--admin-font-sans)', color: 'var(--admin-text)', outline: 'none' }}
          {...register('status')}
        >
          <option value="ACTIVE">Active — Visible on storefront</option>
          <option value="DRAFT">Draft — Not published</option>
          <option value="ARCHIVED">Archived — Hidden</option>
        </select>
        {errors.status && <p style={{ fontSize: '12px', color: 'var(--admin-danger)', marginTop: '4px', fontWeight: 500 }}>{errors.status.message}</p>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', border: '1px solid var(--admin-border-light)', borderRadius: 'var(--admin-radius-lg)', marginTop: '16px' }}>
        <input 
          type="checkbox" 
          className="admin-checkbox" 
          id="featured" 
          {...register('is_featured')}
        />
        <label htmlFor="featured" style={{ fontSize: '14px', color: 'var(--admin-text)', cursor: 'pointer' }}>Featured product</label>
      </div>
    </FormSection>
  );
}
