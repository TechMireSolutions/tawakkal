import { useFormContext, Controller } from 'react-hook-form';
import { FormSection } from '../../../components/ui/PageLayout';
import ImageUploader from './ImageUploader';

export default function MediaTab() {
  const { control, formState: { errors } } = useFormContext();

  return (
    <FormSection title="Product Images" subtitle="Upload high-quality images for the product">
      <Controller
        name="media"
        control={control}
        render={({ field }) => (
          <ImageUploader 
            value={field.value} 
            onChange={field.onChange} 
          />
        )}
      />
      {errors.media && (
        <p style={{ fontSize: '12px', color: 'var(--admin-danger)', marginTop: '8px', fontWeight: 500 }}>
          {errors.media.message}
        </p>
      )}
    </FormSection>
  );
}
