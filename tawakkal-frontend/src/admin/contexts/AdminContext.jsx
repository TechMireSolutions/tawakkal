/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useReducer, useCallback, useEffect, useState } from 'react';
import { authService } from '../services/auth.service';

const AdminContext = createContext(null);

const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  CONTENT_EDITOR: 'content_editor',
  SUPPORT_STAFF: 'support_staff',
  SALES: 'sales',
};

const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: ['*'],
  [ROLES.MANAGER]: [
    'dashboard', 'products', 'categories', 'orders', 'customers',
    'analytics', 'settings', 'media', 'notifications',
  ],
  [ROLES.CONTENT_EDITOR]: [
    'dashboard', 'cms', 'static-pages', 'blogs', 'faqs', 'media',
  ],
  [ROLES.SUPPORT_STAFF]: [
    'dashboard', 'orders', 'customers', 'inquiries', 'surveys', 'notifications',
  ],
  [ROLES.SALES]: [
    'dashboard', 'products', 'orders', 'customers', 'analytics',
  ],
};

const initialState = {
  sidebarCollapsed: false,
  sidebarMobileOpen: false,
  theme: 'light',
  currentUser: null,
  notifications: [],
  unreadCount: 0,
  breadcrumbs: [],
  commandPaletteOpen: false,
  searchQuery: '',
  dashboardWidgets: null,
};

function adminReducer(state, action) {
  switch (action.type) {
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarCollapsed: !state.sidebarCollapsed };
    case 'SET_SIDEBAR_COLLAPSED':
      return { ...state, sidebarCollapsed: action.payload };
    case 'TOGGLE_MOBILE_SIDEBAR':
      return { ...state, sidebarMobileOpen: !state.sidebarMobileOpen };
    case 'CLOSE_MOBILE_SIDEBAR':
      return { ...state, sidebarMobileOpen: false };
    case 'SET_THEME':
      return { ...state, theme: action.payload };
    case 'TOGGLE_THEME':
      return { ...state, theme: state.theme === 'light' ? 'dark' : 'light' };
    case 'SET_BREADCRUMBS':
      return { ...state, breadcrumbs: action.payload };
    case 'SET_NOTIFICATIONS':
      return { ...state, notifications: action.payload };
    case 'SET_UNREAD_COUNT':
      return { ...state, unreadCount: action.payload };
    case 'TOGGLE_COMMAND_PALETTE':
      return { ...state, commandPaletteOpen: !state.commandPaletteOpen };
    case 'SET_COMMAND_PALETTE':
      return { ...state, commandPaletteOpen: action.payload };
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };
    case 'SET_DASHBOARD_WIDGETS':
      return { ...state, dashboardWidgets: action.payload };
    case 'SET_CURRENT_USER':
      return { ...state, currentUser: action.payload };
    default:
      return state;
  }
}

export function AdminProvider({ children }) {
  const [state, dispatch] = useReducer(adminReducer, initialState);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('admin_access_token');
      if (token) {
        try {
          const user = await authService.me();
          // Map Django groups to our roles (simplified logic)
          const role = user.groups && user.groups.length > 0 ? user.groups[0].toLowerCase() : ROLES.ADMIN;
          const name = (user.first_name || user.last_name)
            ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
            : (user.email ? user.email.split('@')[0] : 'Admin User');
            
          dispatch({ type: 'SET_CURRENT_USER', payload: { ...user, role, name } });
        } catch (err) {
          console.error('Failed to load user', err);
          dispatch({ type: 'SET_CURRENT_USER', payload: null });
        }
      } else {
        dispatch({ type: 'SET_CURRENT_USER', payload: null });
      }
      setLoadingAuth(false);
    };

    initAuth();
    
    // Listen for custom logout event
    const handleLogout = () => {
      dispatch({ type: 'SET_CURRENT_USER', payload: null });
    };
    window.addEventListener('auth-logout', handleLogout);
    return () => window.removeEventListener('auth-logout', handleLogout);
  }, []);

  const hasPermission = useCallback((module) => {
    if (!state.currentUser) return false;
    const userRole = state.currentUser.role;
    const permissions = ROLE_PERMISSIONS[userRole] || [];
    return permissions.includes('*') || permissions.includes(module);
  }, [state.currentUser]);

  const toggleSidebar = useCallback(() => dispatch({ type: 'TOGGLE_SIDEBAR' }), []);
  const setSidebarCollapsed = useCallback((v) => dispatch({ type: 'SET_SIDEBAR_COLLAPSED', payload: v }), []);
  const toggleMobileSidebar = useCallback(() => dispatch({ type: 'TOGGLE_MOBILE_SIDEBAR' }), []);
  const closeMobileSidebar = useCallback(() => dispatch({ type: 'CLOSE_MOBILE_SIDEBAR' }), []);
  const setTheme = useCallback((t) => dispatch({ type: 'SET_THEME', payload: t }), []);
  const toggleTheme = useCallback(() => dispatch({ type: 'TOGGLE_THEME' }), []);
  const setBreadcrumbs = useCallback((b) => dispatch({ type: 'SET_BREADCRUMBS', payload: b }), []);
  const setNotifications = useCallback((n) => dispatch({ type: 'SET_NOTIFICATIONS', payload: n }), []);
  const setUnreadCount = useCallback((c) => dispatch({ type: 'SET_UNREAD_COUNT', payload: c }), []);
  const toggleCommandPalette = useCallback(() => dispatch({ type: 'TOGGLE_COMMAND_PALETTE' }), []);
  const setCommandPaletteOpen = useCallback((v) => dispatch({ type: 'SET_COMMAND_PALETTE', payload: v }), []);
  const setDashboardWidgets = useCallback((w) => dispatch({ type: 'SET_DASHBOARD_WIDGETS', payload: w }), []);

  const value = {
    ...state,
    loadingAuth,
    dispatch,
    hasPermission,
    toggleSidebar,
    setSidebarCollapsed,
    toggleMobileSidebar,
    closeMobileSidebar,
    setTheme,
    toggleTheme,
    setBreadcrumbs,
    setNotifications,
    setUnreadCount,
    toggleCommandPalette,
    setCommandPaletteOpen,
    setDashboardWidgets,
    ROLES,
    ROLE_PERMISSIONS,
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within AdminProvider');
  }
  return context;
}

export { ROLES, ROLE_PERMISSIONS };
export default AdminContext;
