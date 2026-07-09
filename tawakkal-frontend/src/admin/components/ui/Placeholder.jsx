import { motion } from 'framer-motion';
import { HiOutlineWrenchScrewdriver } from 'react-icons/hi2';
import { PageContainer, PageHeader } from './PageLayout';

export default function Placeholder({ title = 'Module Unavailable', description = 'This module is currently under construction or the backend endpoints have not been implemented yet.' }) {
  return (
    <PageContainer>
      <PageHeader title={title} breadcrumbs={[{ label: title }]} />
      
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'var(--admin-surface)',
          borderRadius: 'var(--admin-radius-2xl)',
          padding: '64px 32px',
          textAlign: 'center',
          border: '1px dashed var(--admin-border)',
          marginTop: '20px'
        }}
      >
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: 'var(--admin-surface-secondary)', margin: '0 auto 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <HiOutlineWrenchScrewdriver size={32} style={{ color: 'var(--admin-text-muted)' }} />
        </div>
        <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--admin-text)', marginBottom: '12px' }}>{title}</h2>
        <p style={{ fontSize: '14px', color: 'var(--admin-text-secondary)', maxWidth: 500, margin: '0 auto 24px' }}>
          {description}
        </p>
      </motion.div>
    </PageContainer>
  );
}
