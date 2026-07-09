import { useFormContext } from 'react-hook-form';
import { FormSection } from '../../../components/ui/PageLayout';
import Input from '../../../components/ui/Input';

export default function WholesaleTab() {
  const { register, formState: { errors } } = useFormContext();

  return (
    <FormSection title="Wholesale Settings" subtitle="Configure wholesale pricing and rules for this product">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input 
            type="checkbox" 
            id="wholesale_enabled" 
            {...register('wholesale_enabled')}
          />
          <label htmlFor="wholesale_enabled" style={{ fontSize: '14px', color: 'var(--admin-text)' }}>
            Enable Wholesale for this product
          </label>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
          <Input 
            label="Wholesale Price (PKR)" 
            placeholder="8000" 
            type="number"
            step="0.01"
            {...register('wholesale_price')}
            error={errors.wholesale_price?.message}
          />
          <Input 
            label="Minimum Quantity" 
            placeholder="6" 
            type="number"
            {...register('wholesale_min_quantity')}
            error={errors.wholesale_min_quantity?.message}
          />
          <Input 
            label="Step Quantity (Multiples of)" 
            placeholder="6" 
            type="number"
            {...register('wholesale_step_quantity')}
            error={errors.wholesale_step_quantity?.message}
          />
        </div>
      </div>
    </FormSection>
  );
}
