import { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  HiOutlineMagnifyingGlass, HiOutlineBell, HiOutlineSun, HiOutlineMoon,
  HiBars3, HiXMark, HiChevronDown, HiChevronLeft, HiChevronRight,
  HiArrowRightOnRectangle, HiOutlineUserCircle, HiOutlineCog6Tooth,
} from 'react-icons/hi2';
import { useAdmin } from '../contexts/AdminContext';
import { SIDEBAR_NAVIGATION } from '../utils/constants';
import { useIsMobile } from '../hooks/useMediaQuery';
import { useClickOutside } from '../hooks/useClickOutside';
import Avatar from '../components/ui/Avatar';
import ErrorBoundary from '../components/ErrorBoundary';
import CommandPalette from '../components/ui/CommandPalette';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import '../styles/admin.css';

export default function AdminLayout() {
  const {
    sidebarCollapsed, toggleSidebar, setSidebarCollapsed,
    sidebarMobileOpen, toggleMobileSidebar, closeMobileSidebar,
    theme, toggleTheme,
    currentUser, hasPermission, unreadCount,
    toggleCommandPalette,
  } = useAdmin();

  const siteSettings = useSiteSettings();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [profileOpen, setProfileOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState({});
  const profileRef = useClickOutside(() => setProfileOpen(false));

  // Close mobile sidebar on route change
  useEffect(() => {
    closeMobileSidebar();
  }, [location.pathname, closeMobileSidebar]);

  // Auto-collapse sidebar on smaller screens
  useEffect(() => {
    if (window.innerWidth < 1200 && !isMobile) {
      setSidebarCollapsed(true);
    }
  }, [isMobile, setSidebarCollapsed]);

  // Keyboard shortcut for command palette
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        toggleCommandPalette();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleCommandPalette]);

  const handleLogout = () => {
    import('../services/auth.service').then(({ authService }) => {
      authService.logout();
    });
  };

  const toggleGroup = (group) => {
    setExpandedGroups((prev) => ({ ...prev, [group]: !prev[group] }));
  };

  // Filter sidebar items by permission
  const filteredNav = SIDEBAR_NAVIGATION.map((group) => ({
    ...group,
    items: group.items.filter((item) => hasPermission(item.permission)),
  })).filter((group) => group.items.length > 0);

  const sidebarWidth = sidebarCollapsed ? 'var(--admin-sidebar-collapsed)' : 'var(--admin-sidebar-width)';

  return (
    <div className="admin-root" style={{ display: 'flex', minHeight: '100vh' }}>
      <CommandPalette />
      {/* ═══ Sidebar ═══ */}
      {/* Desktop sidebar */}
      {!isMobile && (
        <aside
          style={{
            width: sidebarWidth,
            minWidth: sidebarWidth,
            height: '100vh',
            position: 'sticky',
            top: 0,
            display: 'flex',
            flexDirection: 'column',
            background: 'var(--admin-primary)',
            transition: 'width var(--admin-transition-slow), min-width var(--admin-transition-slow)',
            zIndex: 40,
            overflow: 'hidden',
          }}
        >
          <SidebarContent
            collapsed={sidebarCollapsed}
            filteredNav={filteredNav}
            expandedGroups={expandedGroups}
            toggleGroup={toggleGroup}
            onToggle={toggleSidebar}
            location={location}
            siteSettings={siteSettings}
          />
        </aside>
      )}

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {isMobile && sidebarMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMobileSidebar}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.5)',
                zIndex: 49,
              }}
            />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              style={{
                position: 'fixed',
                left: 0,
                top: 0,
                bottom: 0,
                width: 'var(--admin-sidebar-width)',
                background: 'var(--admin-primary)',
                zIndex: 50,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <SidebarContent
                collapsed={false}
                filteredNav={filteredNav}
                expandedGroups={expandedGroups}
                toggleGroup={toggleGroup}
                onClose={closeMobileSidebar}
                location={location}
                siteSettings={siteSettings}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ═══ Main Area ═══ */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Navbar */}
        <header
          className="admin-glass"
          style={{
            height: 'var(--admin-navbar-height)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px',
            position: 'sticky',
            top: 0,
            zIndex: 30,
            borderBottom: '1px solid var(--admin-border-light)',
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(16px)',
          }}
        >
          {/* Left — Mobile menu + Search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {isMobile && (
              <button
                onClick={toggleMobileSidebar}
                aria-label="Toggle menu"
                style={{
                  width: 36, height: 36, borderRadius: 'var(--admin-radius-md)',
                  border: 'none', background: 'var(--admin-surface-secondary)',
                  color: 'var(--admin-text)', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <HiBars3 size={20} />
              </button>
            )}
            <button
              onClick={toggleCommandPalette}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '8px 14px', borderRadius: 'var(--admin-radius-lg)',
                border: '1px solid var(--admin-border)',
                background: 'var(--admin-surface-secondary)', cursor: 'pointer',
                color: 'var(--admin-text-muted)', fontSize: '13px',
                fontFamily: 'var(--admin-font-sans)',
                minWidth: isMobile ? 'auto' : '240px',
                transition: 'all var(--admin-transition-fast)',
              }}
            >
              <HiOutlineMagnifyingGlass size={16} />
              {!isMobile && (
                <>
                  <span>Search…</span>
                  <kbd
                    style={{
                      marginLeft: 'auto', fontSize: '11px', fontWeight: 600,
                      padding: '2px 6px', borderRadius: '4px',
                      background: 'var(--admin-surface)',
                      border: '1px solid var(--admin-border)',
                      color: 'var(--admin-text-muted)',
                    }}
                  >
                    ⌘K
                  </kbd>
                </>
              )}
            </button>
          </div>

          {/* Right — Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              style={{
                width: 36, height: 36, borderRadius: 'var(--admin-radius-md)',
                border: 'none', background: 'transparent',
                color: 'var(--admin-text-secondary)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all var(--admin-transition-fast)',
              }}
            >
              {theme === 'light' ? <HiOutlineMoon size={19} /> : <HiOutlineSun size={19} />}
            </button>

            {/* Notifications */}
            <button
              onClick={() => navigate('/admin/notifications')}
              aria-label="Notifications"
              style={{
                width: 36, height: 36, borderRadius: 'var(--admin-radius-md)',
                border: 'none', background: 'transparent',
                color: 'var(--admin-text-secondary)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative',
                transition: 'all var(--admin-transition-fast)',
              }}
            >
              <HiOutlineBell size={19} />
              {unreadCount > 0 && <span className="admin-notification-badge" />}
            </button>

            {/* Divider */}
            <div style={{ width: 1, height: 24, background: 'var(--admin-border)', margin: '0 8px' }} />

            {/* Profile dropdown */}
            <div ref={profileRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '4px 8px 4px 4px', borderRadius: 'var(--admin-radius-lg)',
                  border: 'none', background: profileOpen ? 'var(--admin-surface-secondary)' : 'transparent',
                  cursor: 'pointer', transition: 'all var(--admin-transition-fast)',
                }}
              >
                <Avatar name={currentUser.name} size="sm" status="online" />
                {!isMobile && (
                  <div style={{ textAlign: 'left' }}>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--admin-text)', margin: 0, lineHeight: 1.2 }}>
                      {currentUser.name}
                    </p>
                    <p style={{ fontSize: '11px', color: 'var(--admin-text-muted)', margin: 0, textTransform: 'capitalize' }}>
                      {currentUser.role.replace('_', ' ')}
                    </p>
                  </div>
                )}
                <HiChevronDown size={14} style={{ color: 'var(--admin-text-muted)' }} />
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 8px)',
                      right: 0,
                      width: '220px',
                      background: 'var(--admin-surface)',
                      borderRadius: 'var(--admin-radius-lg)',
                      border: '1px solid var(--admin-border)',
                      boxShadow: 'var(--admin-shadow-lg)',
                      padding: '4px',
                      zIndex: 50,
                    }}
                  >
                    {[
                      { icon: HiOutlineUserCircle, label: 'Profile', path: '/admin/profile' },
                      { icon: HiOutlineCog6Tooth, label: 'Settings', path: '/admin/settings' },
                    ].map((item) => (
                      <NavLink
                        key={item.label}
                        to={item.path}
                        onClick={() => setProfileOpen(false)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '10px',
                          padding: '10px 12px', borderRadius: 'var(--admin-radius-md)',
                          textDecoration: 'none', color: 'var(--admin-text-secondary)',
                          fontSize: '13px', fontWeight: 500,
                          transition: 'all var(--admin-transition-fast)',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--admin-surface-secondary)'; e.currentTarget.style.color = 'var(--admin-text)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--admin-text-secondary)'; }}
                      >
                        <item.icon size={18} /> {item.label}
                      </NavLink>
                    ))}
                    <div style={{ height: 1, background: 'var(--admin-border-light)', margin: '4px 0' }} />
                    <button
                      onClick={handleLogout}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '10px 12px', borderRadius: 'var(--admin-radius-md)',
                        border: 'none', background: 'transparent',
                        color: 'var(--admin-danger)', cursor: 'pointer',
                        fontSize: '13px', fontWeight: 500, width: '100%',
                        transition: 'all var(--admin-transition-fast)',
                        fontFamily: 'var(--admin-font-sans)',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--admin-danger-light)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      <HiArrowRightOnRectangle size={18} /> Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main style={{ flex: 1, overflow: 'auto' }}>
          <ErrorBoundary>
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}

/* ═══ Sidebar Content Component ═══ */
function SidebarContent({ collapsed, filteredNav, expandedGroups, toggleGroup, onToggle, onClose, location, siteSettings }) {
  return (
    <>
      {/* Logo */}
      <div
        style={{
          height: 'var(--admin-navbar-height)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          padding: collapsed ? '0' : '0 20px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          flexShrink: 0,
        }}
      >
        {!collapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {(siteSettings?.login_logo_url || siteSettings?.main_logo_url) ? (
              <img 
                src={siteSettings?.login_logo_url || siteSettings?.main_logo_url} 
                alt={siteSettings?.site_name || "Admin Panel"} 
                style={{ maxHeight: '32px', maxWidth: '180px', objectFit: 'contain' }}
              />
            ) : (
              <>
                <div
                  style={{
                    width: 32, height: 32, borderRadius: 'var(--admin-radius-md)',
                    background: 'var(--admin-accent)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 900, fontSize: '14px', color: '#1A1A1A',
                    fontFamily: 'var(--admin-font-display)',
                  }}
                >
                  {siteSettings?.site_name ? siteSettings.site_name.charAt(0).toUpperCase() : 'T'}
                </div>
                <span
                  style={{
                    fontSize: '16px', fontWeight: 800, color: 'var(--admin-text-inverse)',
                    fontFamily: 'var(--admin-font-display)',
                    letterSpacing: '-0.02em',
                  }}
                >
                  {siteSettings?.site_name || 'Admin Panel'}
                </span>
              </>
            )}
          </div>
        )}
        {collapsed && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {(siteSettings?.login_logo_url || siteSettings?.main_logo_url) ? (
              <img 
                src={siteSettings?.login_logo_url || siteSettings?.main_logo_url} 
                alt={siteSettings?.site_name || "Admin Panel"} 
                style={{ maxHeight: '32px', maxWidth: '32px', objectFit: 'contain' }}
              />
            ) : (
              <div
                style={{
                  width: 36, height: 36, borderRadius: 'var(--admin-radius-md)',
                  background: 'var(--admin-accent)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 900, fontSize: '16px', color: '#1A1A1A',
                  fontFamily: 'var(--admin-font-display)',
                }}
              >
                {siteSettings?.site_name ? siteSettings.site_name.charAt(0).toUpperCase() : 'T'}
              </div>
            )}
          </div>
        )}
        {onClose && (
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: 'var(--admin-radius-sm)',
              border: 'none', background: 'rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.6)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <HiXMark size={18} />
          </button>
        )}
        {onToggle && !collapsed && (
          <button
            onClick={onToggle}
            aria-label="Collapse sidebar"
            style={{
              width: 28, height: 28, borderRadius: 'var(--admin-radius-sm)',
              border: 'none', background: 'rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.5)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all var(--admin-transition-fast)',
            }}
          >
            <HiChevronLeft size={16} />
          </button>
        )}
      </div>

      {/* Expand button when collapsed */}
      {collapsed && onToggle && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0' }}>
          <button
            onClick={onToggle}
            aria-label="Expand sidebar"
            style={{
              width: 28, height: 28, borderRadius: 'var(--admin-radius-sm)',
              border: 'none', background: 'rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.5)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <HiChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Navigation */}
      <nav
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: collapsed ? '8px' : '12px',
        }}
      >
        {filteredNav.map((group) => (
          <div key={group.group} style={{ marginBottom: '16px' }}>
            {!collapsed && (
              <p
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: 'rgba(255,255,255,0.35)',
                  padding: '0 12px',
                  marginBottom: '6px',
                }}
              >
                {group.group}
              </p>
            )}
            {group.items.map((item) => {
              const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
              const hasChildren = item.children && item.children.length > 0;
              const isExpanded = expandedGroups[item.label];
              const Icon = item.icon;

              return (
                <div key={item.label}>
                  <NavLink
                    to={hasChildren ? '#' : item.path}
                    onClick={(e) => {
                      if (hasChildren) {
                        e.preventDefault();
                        toggleGroup(item.label);
                      }
                    }}
                    title={collapsed ? item.label : undefined}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: collapsed ? 'center' : 'flex-start',
                      gap: '10px',
                      padding: collapsed ? '10px' : '9px 12px',
                      borderRadius: 'var(--admin-radius-md)',
                      textDecoration: 'none',
                      color: isActive ? 'var(--admin-text-inverse)' : 'rgba(255,255,255,0.55)',
                      background: isActive ? 'rgba(255,255,255,0.12)' : 'transparent',
                      fontSize: '13px',
                      fontWeight: isActive ? 600 : 500,
                      fontFamily: 'var(--admin-font-sans)',
                      transition: 'all var(--admin-transition-fast)',
                      marginBottom: '2px',
                      position: 'relative',
                    }}
                  >
                    <Icon size={19} style={{ flexShrink: 0 }} />
                    {!collapsed && (
                      <>
                        <span style={{ flex: 1 }}>{item.label}</span>
                        {item.badge && (
                          <span
                            style={{
                              width: 8, height: 8, borderRadius: '50%',
                              background: 'var(--admin-accent)',
                              boxShadow: '0 0 8px rgba(212,175,55,0.4)',
                              flexShrink: 0,
                            }}
                          />
                        )}
                        {hasChildren && (
                          <HiChevronDown
                            size={14}
                            style={{
                              transition: 'transform var(--admin-transition-fast)',
                              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                              opacity: 0.5,
                            }}
                          />
                        )}
                      </>
                    )}
                  </NavLink>

                  {/* Children */}
                  {hasChildren && isExpanded && !collapsed && (
                    <div style={{ paddingLeft: '28px', marginTop: '2px' }}>
                      {item.children.map((child) => {
                        const childActive = location.pathname === child.path;
                        return (
                          <NavLink
                            key={child.label}
                            to={child.path}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              padding: '8px 12px',
                              borderRadius: 'var(--admin-radius-md)',
                              textDecoration: 'none',
                              fontSize: '12px',
                              fontWeight: childActive ? 600 : 400,
                              color: childActive ? 'var(--admin-text-inverse)' : 'rgba(255,255,255,0.45)',
                              background: childActive ? 'rgba(255,255,255,0.08)' : 'transparent',
                              transition: 'all var(--admin-transition-fast)',
                              marginBottom: '1px',
                            }}
                          >
                            <span
                              style={{
                                width: 4, height: 4, borderRadius: '50%',
                                background: childActive ? 'var(--admin-accent)' : 'rgba(255,255,255,0.3)',
                                flexShrink: 0,
                              }}
                            />
                            {child.label}
                          </NavLink>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div
          style={{
            padding: '16px',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            flexShrink: 0,
          }}
        >
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px',
              borderRadius: 'var(--admin-radius-md)',
              background: 'rgba(255,255,255,0.06)',
              color: 'rgba(255,255,255,0.5)',
              textDecoration: 'none',
              fontSize: '12px',
              fontWeight: 500,
              transition: 'all var(--admin-transition-fast)',
            }}
          >
            View Storefront →
          </a>
        </div>
      )}
    </>
  );
}
