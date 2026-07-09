import { PageContainer, PageHeader, FormSection } from '../../components/ui/PageLayout';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';
import { useAdmin } from '../../contexts/AdminContext';
import { useToast } from '../../components/ui/Toast';

export default function Profile() {
  const { currentUser } = useAdmin();
  const toast = useToast();

  return (
    <PageContainer>
      <PageHeader title="Profile" subtitle="Manage your account" breadcrumbs={[{ label: 'Profile' }]} />

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '32px', padding: '24px', background: 'var(--admin-surface)', borderRadius: 'var(--admin-radius-xl)', border: '1px solid var(--admin-border-light)' }}>
        <Avatar name={currentUser.name} size="xl" status="online" />
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--admin-text)', fontFamily: 'var(--admin-font-display)', margin: 0 }}>{currentUser.name}</h2>
          <p style={{ fontSize: '14px', color: 'var(--admin-text-secondary)', margin: '4px 0 0', textTransform: 'capitalize' }}>{currentUser.role.replace('_', ' ')}</p>
          <p style={{ fontSize: '13px', color: 'var(--admin-text-muted)', margin: '4px 0 0' }}>{currentUser.email}</p>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <Button variant="secondary" size="sm">Change Avatar</Button>
        </div>
      </div>

      <FormSection title="Personal Information">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <Input label="Full Name" defaultValue={currentUser.name} />
          <Input label="Email" defaultValue={currentUser.email} type="email" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <Input label="Phone" placeholder="+92 300 1234567" />
          <Input label="Role" defaultValue={currentUser.role.replace('_', ' ')} disabled />
        </div>
      </FormSection>

      <FormSection title="Change Password">
        <Input label="Current Password" type="password" placeholder="••••••••" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <Input label="New Password" type="password" placeholder="••••••••" />
          <Input label="Confirm New Password" type="password" placeholder="••••••••" />
        </div>
      </FormSection>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '12px' }}>
        <Button variant="secondary">Cancel</Button>
        <Button onClick={() => toast.success('Profile updated')}>Save Changes</Button>
      </div>
    </PageContainer>
  );
}
