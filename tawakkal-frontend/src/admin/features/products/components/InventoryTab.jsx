import { useFormContext } from 'react-hook-form';
import { FormSection } from '../../../components/ui/PageLayout';
import Input from '../../../components/ui/Input';

export default function InventoryTab() {
  const { register, formState: { errors } } = useFormContext();

  return (
    <FormSection title="Inventory" subtitle="Track stock levels">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <Input 
          label="Stock Quantity" 
          placeholder="45" 
          type="number" 
          required 
          {...register('stock', { valueAsNumber: true })}
          error={errors.stock?.message}
        />
        <Input 
          label="Low Stock Threshold" 
          placeholder="5" 
          type="number" 
          {...register('low_stock_threshold', { valueAsNumber: true })}
          error={errors.low_stock_threshold?.message}
        />
      </div>
    </FormSection>
  );
}
