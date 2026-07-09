import { Navigate, useLocation } from 'react-router-dom';
import { useAdmin } from '../contexts/AdminContext';
import { PageContainer } from '../components/ui/PageLayout';

/**
 * Protected route wrapper for admin pages.
 * Validates real JWT sessions.
 */
const ProtectedAdminRoute = ({ children }) => {
  const location = useLocation();
  const { currentUser, loadingAuth } = useAdmin();

  if (loadingAuth) {
    return (
      <PageContainer>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <div className="admin-skeleton" style={{ width: 40, height: 40, borderRadius: '50%' }} />
        </div>
      </PageContainer>
    );
  }

  if (!currentUser) {
    return <Navigate to="/admin-login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedAdminRoute;
