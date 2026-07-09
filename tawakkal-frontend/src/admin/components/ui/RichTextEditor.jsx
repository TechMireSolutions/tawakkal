import { useRef, useEffect } from 'react';
import { 
  HiOutlineBold, HiOutlineItalic, HiOutlineUnderline, HiOutlineLink, 
  HiOutlineListBullet, HiOutlineDocumentText 
} from 'react-icons/hi2';

const ToolbarButton = ({ icon: Icon, label, onClick }) => (
  <button
    type="button"
    title={label}
    onClick={onClick}
    style={{
      width: 28, height: 28, borderRadius: 'var(--admin-radius-sm)',
      border: 'none', background: 'transparent',
      color: 'var(--admin-text-secondary)', cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      transition: 'all var(--admin-transition-fast)'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.background = 'var(--admin-surface-secondary)';
      e.currentTarget.style.color = 'var(--admin-text)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = 'transparent';
      e.currentTarget.style.color = 'var(--admin-text-secondary)';
    }}
  >
    <Icon size={16} />
  </button>
);

export default function RichTextEditor({ value, onChange, placeholder = 'Start writing...' }) {
  const editorRef = useRef(null);
  
  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const exec = (command, value = null) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      editorRef.current.focus();
      onChange?.(editorRef.current.innerHTML);
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange?.(editorRef.current.innerHTML);
    }
  };

  const handleLink = () => {
    const url = prompt('Enter link URL:');
    if (url) {
      exec('createLink', url);
    }
  };

  return (
    <div
      style={{
        border: '1px solid var(--admin-border)',
        borderRadius: 'var(--admin-radius-lg)',
        overflow: 'hidden',
        background: 'var(--admin-surface)',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <div 
        style={{ 
          display: 'flex', alignItems: 'center', gap: '4px', 
          padding: '8px', borderBottom: '1px solid var(--admin-border-light)',
          background: 'var(--admin-surface-secondary)',
          flexWrap: 'wrap'
        }}
      >
        <ToolbarButton icon={HiOutlineBold} label="Bold" onClick={() => exec('bold')} />
        <ToolbarButton icon={HiOutlineItalic} label="Italic" onClick={() => exec('italic')} />
        <ToolbarButton icon={HiOutlineUnderline} label="Underline" onClick={() => exec('underline')} />
        <div style={{ width: 1, height: 20, background: 'var(--admin-border)', margin: '0 4px' }} />
        <ToolbarButton icon={HiOutlineListBullet} label="Bullet List" onClick={() => exec('insertUnorderedList')} />
        <ToolbarButton icon={() => <span style={{fontWeight: 'bold', fontSize: '12px'}}>1.</span>} label="Numbered List" onClick={() => exec('insertOrderedList')} />
        <ToolbarButton icon={HiOutlineLink} label="Link" onClick={handleLink} />
      </div>

      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onBlur={handleInput}
        style={{
          width: '100%', minHeight: '200px', padding: '16px',
          border: 'none', outline: 'none', resize: 'vertical',
          fontSize: '14px', fontFamily: 'var(--admin-font-sans)',
          color: 'var(--admin-text)', lineHeight: 1.6,
          background: 'transparent',
          overflowY: 'auto'
        }}
        data-placeholder={placeholder}
      />
      <style>{`
        div[contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: var(--admin-text-muted);
          pointer-events: none;
          display: block;
        }
      `}</style>
    </div>
  );
}
