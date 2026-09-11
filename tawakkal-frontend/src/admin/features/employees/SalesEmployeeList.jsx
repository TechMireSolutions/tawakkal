import { useState, useEffect, useMemo, useCallback } from 'react';
import { HiOutlineMagnifyingGlass, HiOutlineClipboardDocument, HiOutlinePlus } from 'react-icons/hi2';
import { PageContainer, PageHeader } from '../../components/ui/PageLayout';
import { ContentCard } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { getSalesEmployees, createSalesEmployee, updateSalesEmployee } from '../../services/api';
import { formatDate } from '../../utils/formatters';

export default function SalesEmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ first_name: '', last_name: '' });
  const [error, setError] = useState(null);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getSalesEmployees();
      setEmployees(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      await Promise.resolve(); // Defers rendering logic frames smoothly out of layout steps
      if (isMounted) {
        await fetchEmployees();
      }
    };

    loadData();
    return () => {
      isMounted = false;
    };
  }, [fetchEmployees]);

  const filtered = useMemo(() => {
    if (!search) return employees;
    const q = search.toLowerCase();
    return employees.filter(e => {
      const name = `${e.first_name} ${e.last_name}`.toLowerCase();
      const code = e.coupon_code?.toLowerCase() || '';
      return name.includes(q) || code.includes(q);
    });
  }, [employees, search]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await createSalesEmployee(formData);
      setIsModalOpen(false);
      setFormData({ first_name: '', last_name: '' });
      await fetchEmployees();
    } catch (err) {
      if (err.response?.data) {
        if (typeof err.response.data === 'object' && err.response.data.non_field_errors) {
          setError(err.response.data.non_field_errors[0]);
        } else if (Array.isArray(err.response.data)) {
          setError(err.response.data[0]);
        } else {
          setError(Object.values(err.response.data).join(', '));
        }
      } else {
        setError('Failed to create sales employee. Ensure first and last name combination is unique.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStatus = async (employee) => {
    try {
      await updateSalesEmployee(employee.id, { is_active: !employee.is_active });
      await fetchEmployees();
    } catch {
      alert("Failed to update status");
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert(`Copied ${text} to clipboard!`);
  };

  return (
    <PageContainer>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <PageHeader
          title="Sales Employees"
          subtitle={`${employees.length} sales employees configured`}
          breadcrumbs={[{ label: 'Employees' }]}
        />
        <button
          onClick={() => { setError(null); setIsModalOpen(true); }}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: 'var(--admin-primary)', color: 'white',
            border: 'none', padding: '10px 16px', borderRadius: '8px',
            cursor: 'pointer', fontWeight: '500', marginTop: '20px'
          }}
        >
          <HiOutlinePlus size={20} /> Add Employee
        </button>
      </div>

      <ContentCard noPadding>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--admin-border-light)' }}>
          <Input
            placeholder="Search by name or code..."
            icon={HiOutlineMagnifyingGlass}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="sm"
            containerClassName="admin-product-search"
          />
        </div>

        {loading ? <TableSkeleton rows={5} columns={5} /> : filtered.length === 0 ? <EmptyState title="No employees found" /> : (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Coupon Code</th>
                  <th>Total Orders</th>
                  <th>Joined</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(emp => (
                  <tr key={emp.id}>
                    <td style={{ fontWeight: '500', color: 'var(--admin-text-primary)' }}>
                      {emp.first_name} {emp.last_name}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <code style={{ background: 'var(--admin-bg-light)', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--admin-border-light)' }}>
                          {emp.coupon_code}
                        </code>
                        <button
                          onClick={() => copyToClipboard(emp.coupon_code)}
                          title="Copy Code"
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--admin-text-secondary)', padding: '4px' }}
                        >
                          <HiOutlineClipboardDocument size={18} />
                        </button>
                      </div>
                    </td>
                    <td>{emp.total_orders}</td>
                    <td>{formatDate(emp.created_at)}</td>
                    <td>
                      <Badge variant={emp.is_active ? 'success' : 'neutral'}>
                        {emp.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => toggleStatus(emp)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: emp.is_active ? 'var(--admin-danger)' : 'var(--admin-success)',
                          cursor: 'pointer',
                          fontWeight: '500',
                          textDecoration: 'underline'
                        }}
                      >
                        {emp.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </ContentCard>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Sales Employee">
        <form onSubmit={handleCreate}>
          {error && <div style={{ color: 'var(--admin-danger)', marginBottom: '16px', fontSize: '14px', background: 'var(--admin-danger-light, #fee2e2)', padding: '8px 12px', borderRadius: '6px' }}>{error}</div>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: 'var(--admin-text-primary)' }}>First Name</label>
              <Input
                required
                value={formData.first_name}
                onChange={e => setFormData({ ...formData, first_name: e.target.value })}
                placeholder="e.g. Hassan"
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: 'var(--admin-text-primary)' }}>Last Name</label>
              <Input
                required
                value={formData.last_name}
                onChange={e => setFormData({ ...formData, last_name: e.target.value })}
                placeholder="e.g. Ahmed"
              />
            </div>
            <p style={{ fontSize: '13px', color: 'var(--admin-text-secondary)', margin: 0 }}>
              The coupon code will be generated automatically based on the employee's name.
            </p>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              style={{ background: 'none', border: '1px solid var(--admin-border-dark)', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', color: 'var(--admin-text-primary)', fontWeight: '500' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{ background: 'var(--admin-primary)', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: submitting ? 'not-allowed' : 'pointer', fontWeight: '500', opacity: submitting ? 0.7 : 1 }}
            >
              {submitting ? 'Creating...' : 'Create Employee'}
            </button>
          </div>
        </form>
      </Modal>
    </PageContainer>
  );
}
