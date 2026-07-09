import { useFormContext } from 'react-hook-form';
import { FormSection } from '../../../components/ui/PageLayout';
import Input, { Textarea } from '../../../components/ui/Input';

export default function SeoTab() {
  const { register, formState: { errors } } = useFormContext();

  return (
    <FormSection title="Search Engine Optimization" subtitle="Improve search visibility">
      <Input 
        label="SEO Title" 
        placeholder="Royal Silk Kurta | Tawakkal Luxury" 
        {...register('seo_title')}
        error={errors.seo_title?.message}
      />
      <Textarea 
        label="Meta Description" 
        placeholder="Write a compelling meta description..." 
        rows={3} 
        {...register('seo_description')}
        error={errors.seo_description?.message}
      />
      <Input 
        label="Keywords" 
        placeholder="silk, kurta, luxury, Pakistani" 
        {...register('seo_keywords')}
        error={errors.seo_keywords?.message}
      />
    </FormSection>
  );
}
