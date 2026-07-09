import { useRef, useState } from 'react';
import { HiOutlinePhoto, HiXMark, HiArrowPath } from 'react-icons/hi2';

export default function ImageUploader({
  label,
  description,
  initialUrl,
  onChange,
  onRemove,
  accept = "image/png, image/jpeg, image/svg+xml, image/webp",
  maxSizeMB = 5
}) {
  const [localPreview, setLocalPreview] = useState(null);
  const [isRemoved, setIsRemoved] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const preview = isRemoved ? null : (localPreview || initialUrl || null);

  const handleFile = (file) => {
    if (!file) return;

    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File too large. Maximum allowed size is ${maxSizeMB} MB.`);
      return;
    }

    if (accept && !accept.split(',').map((item) => item.trim()).some((type) => file.type === type || type === '*/*' || type === `${file.type.split('/')[0]}/*`)) {
      setError('Invalid file type. Please upload a supported image format.');
      return;
    }

    setError('');
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          return 100;
        }
        return p + 25;
      });
    }, 100);

    setLocalPreview(URL.createObjectURL(file));
    setIsRemoved(false);
    onChange?.(file);
  };

  const onDragOver = (event) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      handleFile(event.dataTransfer.files[0]);
    }
  };

  const onRemoveClick = (event) => {
    event.stopPropagation();
    setLocalPreview(null);
    setIsRemoved(true);
    setProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
    onRemove?.();
  };

  return (
    <div style={{ marginBottom: '24px' }}>
      {label && <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--admin-text)', marginBottom: '4px' }}>{label}</label>}
      {description && <p style={{ fontSize: '12px', color: 'var(--admin-text-muted)', margin: '0 0 8px 0' }}>{description}</p>}

      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        style={{
          border: `2px dashed ${isDragging ? 'var(--admin-primary)' : 'var(--admin-border)'}`,
          borderRadius: 'var(--admin-radius-lg)',
          backgroundColor: isDragging ? 'rgba(var(--admin-primary-rgb), 0.05)' : 'var(--admin-surface)',
          transition: 'all 0.2s ease',
          padding: '24px',
          textAlign: 'center',
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '160px'
        }}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={(event) => handleFile(event.target.files[0])}
          accept={accept}
          style={{ display: 'none' }}
        />

        {preview ? (
          <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ position: 'relative', maxWidth: '100%', maxHeight: '120px', display: 'flex', justifyContent: 'center' }}>
              <img
                src={preview}
                alt="Preview"
                style={{
                  maxWidth: '100%',
                  maxHeight: '120px',
                  objectFit: 'contain',
                  borderRadius: 'var(--admin-radius-sm)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
              />
            </div>

            {progress > 0 && progress < 100 && (
              <div style={{ width: '100%', height: '4px', backgroundColor: 'var(--admin-border)', borderRadius: '2px', marginTop: '12px', overflow: 'hidden' }}>
                <div style={{ width: `${progress}%`, height: '100%', backgroundColor: 'var(--admin-primary)', transition: 'width 0.2s' }}></div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
              <button
                type="button"
                onClick={(event) => { event.stopPropagation(); fileInputRef.current?.click(); }}
                style={{
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: 600,
                  backgroundColor: 'white',
                  border: '1px solid var(--admin-border)',
                  borderRadius: 'var(--admin-radius-sm)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  color: 'var(--admin-text)'
                }}
              >
                <HiArrowPath size={14} /> Replace
              </button>
              <button
                type="button"
                onClick={onRemoveClick}
                style={{
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: 600,
                  backgroundColor: '#fee2e2',
                  border: '1px solid #fecaca',
                  borderRadius: 'var(--admin-radius-sm)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  color: '#b91c1c'
                }}
              >
                <HiXMark size={14} /> Remove
              </button>
            </div>
            {error && (
              <p style={{ marginTop: '12px', fontSize: '12px', color: '#b91c1c' }}>{error}</p>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--admin-text-muted)' }}>
            <div style={{
              width: '48px', height: '48px',
              borderRadius: '50%', backgroundColor: 'var(--admin-background)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '12px'
            }}>
              <HiOutlinePhoto size={24} color="var(--admin-text-muted)" />
            </div>
            <p style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 500, color: 'var(--admin-text)' }}>No logo uploaded</p>
            <p style={{ margin: 0, fontSize: '12px' }}>Drag & drop an image here, or click to browse</p>
          </div>
        )}
      </div>
    </div>
  );
}