import { useState, useRef, useEffect } from 'react';
import { uploadMedia } from '../../../../api';
import { X, UploadCloud, AlertCircle } from 'lucide-react';
import Button from '../../../components/ui/Button';

export default function ImageUploader({ value = [], onChange }) {
  const [images, setImages] = useState(value || []);
  
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);

  // Sync RHF external changes (e.g. form reset or tab switch remounts) to internal state
  useEffect(() => {
    if (JSON.stringify(value) !== JSON.stringify(images)) {
      setImages(value || []);
    }
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync internal state changes to the parent form
  useEffect(() => {
    if (JSON.stringify(images) !== JSON.stringify(value)) {
      onChange(images);
    }
  }, [images]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFiles(Array.from(e.target.files));
      // Reset input so the same file can be selected again if it fails
      e.target.value = '';
    }
  };

  const processFiles = (files) => {
    const newUploads = files.map(file => ({
      file,
      url: URL.createObjectURL(file), // temporary local preview
      status: 'uploading',
      progress: 0,
      id: Math.random().toString(36).substr(2, 9) // temporary ID for React key
    }));

    setImages(prev => [...prev, ...newUploads]);

    newUploads.forEach(upload => {
      uploadFile(upload);
    });
  };

  const uploadFile = async (upload) => {
    try {
      const res = await uploadMedia(upload.file, (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setImages(prev => prev.map(img => 
          img.id === upload.id ? { ...img, progress: percentCompleted } : img
        ));
      });

      if (res && res.id) {
        // Replace temporary upload object with real data
        setImages(prev => prev.map(img => 
          img.id === upload.id 
            ? { id: res.id, url: res.url || upload.url, status: 'success' }
            : img
        ));
      } else {
        throw new Error(res?.message || 'Upload failed');
      }
    } catch (err) {
      console.error("Upload error:", err);
      setImages(prev => prev.map(img => 
        img.id === upload.id ? { ...img, status: 'error', error: err.message } : img
      ));
    }
  };

  const removeImage = (idToRemove) => {
    setImages(prev => prev.filter(img => img.id !== idToRemove));
  };

  const retryUpload = (upload) => {
    setImages(prev => prev.map(img => 
      img.id === upload.id ? { ...img, status: 'uploading', progress: 0 } : img
    ));
    uploadFile(upload);
  };

  // Simple array swap for reordering (move left/right)
  const moveImage = (index, direction) => {
    if ((direction === -1 && index === 0) || (direction === 1 && index === images.length - 1)) return;
    const newImages = [...images];
    const temp = newImages[index];
    newImages[index] = newImages[index + direction];
    newImages[index + direction] = temp;
    setImages(newImages);
  };

  return (
    <div>
      <div 
        style={{ 
          border: `2px dashed ${dragActive ? 'var(--admin-primary)' : 'var(--admin-border)'}`, 
          borderRadius: 'var(--admin-radius-xl)', 
          padding: '48px', 
          textAlign: 'center', 
          background: dragActive ? 'rgba(27,54,34,0.05)' : 'var(--admin-surface-secondary)', 
          cursor: 'pointer',
          transition: 'all var(--admin-transition-fast)'
        }}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <UploadCloud size={40} color="var(--admin-text-muted)" style={{ margin: '0 auto 16px' }} />
        <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--admin-text)', margin: '0 0 4px' }}>Drag & drop images here</p>
        <p style={{ fontSize: '12px', color: 'var(--admin-text-muted)', margin: '0 0 16px' }}>or click to browse — PNG, JPG up to 5MB</p>
        <Button variant="secondary" size="sm" type="button" onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}>Browse Files</Button>
        <input 
          ref={inputRef}
          type="file" 
          multiple 
          accept="image/png, image/jpeg, image/webp" 
          style={{ display: 'none' }} 
          onChange={handleChange}
        />
      </div>

      {images.length > 0 && (
        <div style={{ marginTop: '24px' }}>
          <p style={{ fontSize: '12px', color: 'var(--admin-text-muted)', marginBottom: '12px' }}>
            First image will be used as the main product image. Use arrows to reorder.
          </p>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            {images.map((img, index) => (
              <div 
                key={img.id} 
                style={{ 
                  position: 'relative', 
                  width: '120px', 
                  height: '120px', 
                  borderRadius: 'var(--admin-radius-lg)', 
                  border: '1px solid var(--admin-border)',
                  overflow: 'hidden',
                  background: 'var(--admin-surface)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {img.url ? (
                  <img src={img.url} alt="Upload preview" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: img.status === 'uploading' ? 0.5 : 1 }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', background: '#eee' }} />
                )}

                {/* Status Overlays */}
                {img.status === 'uploading' && (
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.7)' }}>
                    <div style={{ width: '80%', height: '4px', background: '#e0e0e0', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ width: `${img.progress}%`, height: '100%', background: 'var(--admin-primary)', transition: 'width 0.2s' }} />
                    </div>
                  </div>
                )}

                {img.status === 'error' && (
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(254,226,226,0.9)' }}>
                    <AlertCircle size={24} color="var(--admin-danger)" />
                    <button type="button" onClick={() => retryUpload(img)} style={{ fontSize: '11px', marginTop: '4px', color: 'var(--admin-danger)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Retry</button>
                  </div>
                )}

                {/* Controls */}
                <button 
                  type="button"
                  onClick={() => removeImage(img.id)}
                  style={{ position: 'absolute', top: '4px', right: '4px', width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(0,0,0,0.5)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}
                >
                  <X size={14} />
                </button>

                {img.status === 'success' && images.length > 1 && (
                  <div style={{ position: 'absolute', bottom: '4px', left: '4px', right: '4px', display: 'flex', justifyContent: 'space-between' }}>
                    <button type="button" onClick={() => moveImage(index, -1)} disabled={index === 0} style={{ padding: '2px 6px', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '4px', cursor: index === 0 ? 'not-allowed' : 'pointer', opacity: index === 0 ? 0.3 : 1 }}>{'<'}</button>
                    <button type="button" onClick={() => moveImage(index, 1)} disabled={index === images.length - 1} style={{ padding: '2px 6px', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '4px', cursor: index === images.length - 1 ? 'not-allowed' : 'pointer', opacity: index === images.length - 1 ? 0.3 : 1 }}>{'>'}</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
