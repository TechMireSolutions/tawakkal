import { useFormContext } from 'react-hook-form';
import { FormSection } from '../../../components/ui/PageLayout';
import Input from '../../../components/ui/Input';

export default function PricingTab() {
  const { register, formState: { errors } } = useFormContext();

  return (
    <FormSection title="Pricing" subtitle="Set product pricing and discounts">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <Input 
          label="Price (PKR)" 
          placeholder="12500" 
          type="number"
          step="0.01"
          required 
          {...register('base_price')}
          error={errors.base_price?.message}
        />
        <Input 
          label="Compare at Price" 
          placeholder="15000" 
          type="number"
          step="0.01"
          {...register('compare_at_price')}
          error={errors.compare_at_price?.message}
        />
      </div>
      <Input 
        label="Shipping Price (PKR)" 
        placeholder="250" 
        type="number"
        step="0.01"
        {...register('shipping_price')}
        error={errors.shipping_price?.message}
      />
    </FormSection>
  );
}
