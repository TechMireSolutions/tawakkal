import { useFormContext, useFieldArray } from 'react-hook-form';
import { FormSection } from '../../../components/ui/PageLayout';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';

export default function VariantsTab() {
  const { register, control, formState: { errors } } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "variants"
  });

  return (
    <FormSection title="Variants" subtitle="Manage specific stock and price overrides">
      {fields.map((field, index) => (
        <div key={field.id} style={{ padding: '16px', border: '1px solid var(--admin-border)', borderRadius: 'var(--admin-radius-lg)', marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>Variant {index + 1}</h4>
            <Button variant="ghost" size="sm" onClick={() => remove(index)}>Remove</Button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <Input 
              label="SKU" 
              placeholder="TWK-V-001" 
              {...register(`variants.${index}.sku`)}
              error={errors.variants?.[index]?.sku?.message}
            />
            <Input 
              label="Color ID" 
              placeholder="UUID" 
              {...register(`variants.${index}.color_id`)}
            />
            <Input 
              label="Size ID" 
              placeholder="UUID" 
              {...register(`variants.${index}.size_id`)}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
            <Input 
              label="Price Override" 
              placeholder="13000" 
              type="number" 
              step="0.01"
              {...register(`variants.${index}.price_override`)}
            />
            <Input 
              label="Stock Override" 
              placeholder="10" 
              type="number" 
              {...register(`variants.${index}.stock`, { valueAsNumber: true })}
            />
          </div>
        </div>
      ))}
      <Button variant="secondary" onClick={() => append({ sku: '', color_id: '', size_id: '', price_override: '', stock: 0 })}>
        Add Variant
      </Button>
    </FormSection>
  );
}
