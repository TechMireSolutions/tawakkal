import { useState, useEffect } from 'react';
import { PageContainer, PageHeader, FormSection } from '../../components/ui/PageLayout';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import { fetchSystemConfig, updateSystemConfig } from '../../../api';

export default function SystemConfig() {
  const toast = useToast();
  const [c, setC] = useState({
    maintenance_mode: false,
    allow_registrations: true,
    require_email_verification: false,
    default_language: 'en',
    default_currency: 'USD',
    max_upload_size_mb: 5,
    session_timeout_minutes: 60,
    enable_audit_logging: true,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchSystemConfig();
        if (data && data.data) {
           // Wait, Axios response data might be nested depending on API wrapper.
           // Since `fetchSystemConfig` returns `res`, if it's already unwrapped, use `data`.
           // Let's handle both cases.
           const configData = data.data || data;
           setC({
            maintenance_mode: configData.maintenance_mode ?? false,
            allow_registrations: configData.allow_registrations ?? true,
            require_email_verification: configData.require_email_verification ?? false,
            default_language: configData.default_language ?? 'en',
            default_currency: configData.default_currency ?? 'USD',
            max_upload_size_mb: configData.max_upload_size_mb ?? 5,
            session_timeout_minutes: configData.session_timeout_minutes ?? 60,
            enable_audit_logging: configData.enable_audit_logging ?? true,
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <PageContainer><div>Loading configuration...</div></PageContainer>;

  const handleChange = (e, field) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setC(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      await updateSystemConfig(c);
      toast.success('Configuration saved');
    } catch {
      toast.error('Failed to save configuration');
    }
  };

  return (
    <PageContainer>
      <PageHeader title="System Configuration" subtitle="Website-wide and system settings" breadcrumbs={[{ label: 'Settings', path: '/admin/settings' }, { label: 'System Config' }]} />

      <FormSection title="Application Modes" subtitle="Global application states">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--admin-text)', cursor: 'pointer' }}>
            <input type="checkbox" className="admin-checkbox" checked={c.maintenance_mode} onChange={(e) => handleChange(e, 'maintenance_mode')} />
            Maintenance Mode
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--admin-text)', cursor: 'pointer' }}>
            <input type="checkbox" className="admin-checkbox" checked={c.allow_registrations} onChange={(e) => handleChange(e, 'allow_registrations')} />
            Allow Registrations
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--admin-text)', cursor: 'pointer' }}>
            <input type="checkbox" className="admin-checkbox" checked={c.require_email_verification} onChange={(e) => handleChange(e, 'require_email_verification')} />
            Require Email Verification
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--admin-text)', cursor: 'pointer' }}>
            <input type="checkbox" className="admin-checkbox" checked={c.enable_audit_logging} onChange={(e) => handleChange(e, 'enable_audit_logging')} />
            Enable Audit Logging
          </label>
        </div>
      </FormSection>

      <FormSection title="Localization" subtitle="Default language and currency">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <Input label="Default Language" value={c.default_language} onChange={(e) => handleChange(e, 'default_language')} />
          <Input label="Default Currency" value={c.default_currency} onChange={(e) => handleChange(e, 'default_currency')} />
        </div>
      </FormSection>

      <FormSection title="System Limits">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <Input label="Max Upload Size (MB)" type="number" value={c.max_upload_size_mb} onChange={(e) => handleChange(e, 'max_upload_size_mb')} />
          <Input label="Session Timeout (Minutes)" type="number" value={c.session_timeout_minutes} onChange={(e) => handleChange(e, 'session_timeout_minutes')} />
        </div>
      </FormSection>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '12px' }}>
        <Button onClick={handleSave}>Save Configuration</Button>
      </div>
    </PageContainer>
  );
}
