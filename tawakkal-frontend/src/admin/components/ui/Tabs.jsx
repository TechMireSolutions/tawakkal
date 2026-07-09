import { useState } from 'react';
import { motion } from 'framer-motion';

export default function Tabs({ tabs, defaultTab = 0, onChange }) {
  const [activeIndex, setActiveIndex] = useState(defaultTab);

  const handleTabClick = (index) => {
    setActiveIndex(index);
    onChange?.(index, tabs[index]);
  };

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '2px',
          borderBottom: '1px solid var(--admin-border-light)',
          overflowX: 'auto',
        }}
        role="tablist"
      >
        {tabs.map((tab, index) => (
          <button
            key={index}
            type="button"
            role="tab"
            aria-selected={activeIndex === index}
            onClick={() => handleTabClick(index)}
            style={{
              position: 'relative',
              padding: '12px 20px',
              fontSize: '13px',
              fontWeight: activeIndex === index ? 600 : 500,
              fontFamily: 'var(--admin-font-sans)',
              color: activeIndex === index ? 'var(--admin-primary)' : 'var(--admin-text-secondary)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'color var(--admin-transition-fast)',
            }}
          >
            {tab.label || tab}
            {activeIndex === index && (
              <motion.div
                layoutId="tab-indicator"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                style={{
                  position: 'absolute',
                  bottom: '-1px',
                  left: 0,
                  right: 0,
                  height: '2px',
                  background: 'var(--admin-primary)',
                  borderRadius: '2px 2px 0 0',
                }}
              />
            )}
          </button>
        ))}
      </div>
      <div style={{ padding: '24px 0' }} role="tabpanel">
        {tabs[activeIndex]?.content}
      </div>
    </div>
  );
}
