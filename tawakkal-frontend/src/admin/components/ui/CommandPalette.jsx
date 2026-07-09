import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  HiOutlineMagnifyingGlass, HiOutlineArrowRight, HiOutlineDocumentText,
  HiOutlineShoppingBag, HiOutlineUsers, HiOutlineClipboardDocumentList,
} from 'react-icons/hi2';
import { useAdmin } from '../../contexts/AdminContext';

export default function CommandPalette() {
  const { isCommandPaletteOpen, toggleCommandPalette } = useAdmin();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef(null);

  useEffect(() => {
    if (isCommandPaletteOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isCommandPaletteOpen]);

  const actions = [
    { id: 'dashboard', label: 'Go to Dashboard', path: '/admin', icon: HiOutlineDocumentText },
    { id: 'products', label: 'View Products', path: '/admin/products', icon: HiOutlineShoppingBag },
    { id: 'create-product', label: 'Add New Product', path: '/admin/products/create', icon: HiOutlineShoppingBag },
    { id: 'orders', label: 'View Orders', path: '/admin/orders', icon: HiOutlineClipboardDocumentList },
    { id: 'customers', label: 'View Customers', path: '/admin/customers', icon: HiOutlineUsers },
  ];

  const filtered = query
    ? actions.filter(a => a.label.toLowerCase().includes(query.toLowerCase()))
    : actions;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedIndex(0);
  }, [query]);

  const handleSelect = (path) => {
    toggleCommandPalette();
    navigate(path);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filtered.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % filtered.length);
    } else if (e.key === 'Enter' && filtered.length > 0) {
      e.preventDefault();
      handleSelect(filtered[selectedIndex].path);
    }
  };

  return (
    <AnimatePresence>
      {isCommandPaletteOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '10vh', paddingLeft: '20px', paddingRight: '20px' }}>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
            onClick={toggleCommandPalette}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)' }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -10 }} transition={{ duration: 0.15 }}
            style={{ position: 'relative', width: '100%', maxWidth: '600px', background: 'var(--admin-surface)', borderRadius: 'var(--admin-radius-2xl)', boxShadow: 'var(--admin-shadow-2xl)', overflow: 'hidden', border: '1px solid var(--admin-border)' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--admin-border-light)' }}>
              <HiOutlineMagnifyingGlass size={20} style={{ color: 'var(--admin-text-muted)', marginRight: '12px' }} />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search commands, pages, or jump to..."
                style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: '16px', color: 'var(--admin-text)', fontFamily: 'var(--admin-font-sans)' }}
              />
              <kbd style={{ fontSize: '11px', fontWeight: 600, padding: '2px 6px', borderRadius: '4px', background: 'var(--admin-surface-secondary)', border: '1px solid var(--admin-border)', color: 'var(--admin-text-muted)' }}>ESC</kbd>
            </div>
            <div style={{ maxHeight: '400px', overflowY: 'auto', padding: '12px' }}>
              {filtered.length === 0 ? (
                <div style={{ padding: '32px', textAlign: 'center', color: 'var(--admin-text-muted)', fontSize: '14px' }}>No results found for "{query}"</div>
              ) : (
                filtered.map((action, index) => {
                  const active = index === selectedIndex;
                  return (
                    <div
                      key={action.id}
                      onClick={() => handleSelect(action.path)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      style={{
                        display: 'flex', alignItems: 'center', padding: '12px 16px', gap: '12px',
                        borderRadius: 'var(--admin-radius-lg)', cursor: 'pointer',
                        background: active ? 'var(--admin-primary)' : 'transparent',
                        color: active ? 'white' : 'var(--admin-text)',
                        transition: 'background var(--admin-transition-fast)',
                      }}
                    >
                      <action.icon size={18} style={{ color: active ? 'white' : 'var(--admin-text-secondary)' }} />
                      <span style={{ fontSize: '14px', fontWeight: active ? 600 : 500 }}>{action.label}</span>
                      {active && <HiOutlineArrowRight size={14} style={{ marginLeft: 'auto', opacity: 0.8 }} />}
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
