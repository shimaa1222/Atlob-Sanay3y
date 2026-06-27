// src/components/Upload/ImageUploader.jsx
import React, { useState, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';
import api from '../../services/api';
import { Upload, X, Image, AlertCircle, Loader, CheckCircle } from 'lucide-react';

const ImageUploader = ({ 
  onUpload, 
  multiple = false, 
  maxFiles = 5,
  type = 'post_image', // avatar, profile_photo, national_id, portfolio, post_image, chat_file, document
  autoUpload = false,
  onUploadStart,
  onUploadProgress,
  onUploadComplete,
  onUploadError,
}) => {
  const { darkMode } = useTheme();
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const inputRef = useRef(null);

  // ✅ دالة رفع صورة واحدة
  const uploadSingleImage = async (file) => {
    try {
      const data = await api.uploadImage(file, type);
      return data;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  };

  // ✅ دالة رفع عدة صور
  const uploadMultipleImages = async (files) => {
    try {
      const data = await api.uploadMultiple(files, type);
      return data;
    } catch (error) {
      console.error('Multiple upload error:', error);
      throw error;
    }
  };

  // ✅ رفع الصور تلقائياً
  const uploadFiles = async (files) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadProgress(0);
    setError('');

    if (onUploadStart) onUploadStart();

    try {
      let result;
      if (files.length === 1) {
        // رفع صورة واحدة
        result = await uploadSingleImage(files[0]);
        if (onUploadComplete) onUploadComplete(result);
        if (onUpload) onUpload(files, result);
        setUploadedFiles(prev => [...prev, result]);
      } else {
        // رفع عدة صور
        result = await uploadMultipleImages(files);
        if (onUploadComplete) onUploadComplete(result);
        if (onUpload) onUpload(files, result);
        setUploadedFiles(prev => [...prev, ...(result.uploads || [])]);
      }
      setUploadProgress(100);
      
    } catch (error) {
      setError(error.message || 'حدث خطأ أثناء رفع الصور');
      if (onUploadError) onUploadError(error);
    } finally {
      setUploading(false);
      if (onUploadProgress) onUploadProgress(100);
    }
  };

  const handleFiles = (files) => {
    const validFiles = Array.from(files).filter(file => {
      if (!file.type.startsWith('image/')) {
        setError('يرجى اختيار ملفات صور فقط');
        return false;
      }
      const maxSize = type === 'portfolio' ? 8 : type === 'chat_file' ? 10 : 5;
      if (file.size > maxSize * 1024 * 1024) {
        setError(`حجم الملف يجب أن يكون أقل من ${maxSize}MB`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setError('');

    const newImages = multiple 
      ? [...images, ...validFiles].slice(0, maxFiles) 
      : [validFiles[0]];
    setImages(newImages);

    const newPreviews = newImages.map(file => URL.createObjectURL(file));
    setPreviews(newPreviews);

    // ✅ رفع تلقائي
    if (autoUpload) {
      uploadFiles(newImages);
    } else {
      if (onUpload) onUpload(newImages);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) handleFiles(e.dataTransfer.files);
  };

  const handleChange = (e) => {
    if (e.target.files?.[0]) handleFiles(e.target.files);
    e.target.value = ''; // Reset input
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // ✅ رفع يدوي
  const handleManualUpload = async () => {
    if (images.length === 0) return;
    await uploadFiles(images);
  };

  // ✅ تنظيف الـ preview URLs
  const clearAll = () => {
    previews.forEach(url => URL.revokeObjectURL(url));
    setImages([]);
    setPreviews([]);
    setUploadedFiles([]);
    setError('');
    setUploadProgress(0);
  };

  // Translation
  const t = {
    dragDrop: 'اسحب وأفلت الصور هنا',
    orClick: 'أو اضغط للاختيار',
    fileTypes: 'PNG, JPG',
    maxSize: (type) => {
      const sizes = {
        avatar: '2MB',
        profile_photo: '5MB',
        national_id: '5MB',
        portfolio: '8MB',
        post_image: '5MB',
        chat_file: '10MB',
        document: '10MB',
      };
      return sizes[type] || '5MB';
    },
    maxFiles: (count) => `يمكنك رفع حتى ${count} صور`,
    uploading: 'جاري الرفع...',
    upload: 'رفع',
    uploaded: 'تم الرفع',
    error: 'حدث خطأ',
  };

  const bgColor = darkMode ? '#1e293b' : '#fafbfc';
  const borderColor = darkMode ? '#334155' : '#e2e8f0';
  const textColor = darkMode ? '#94a3b8' : '#64748b';
  const isUploaded = uploadedFiles.length > 0 && !uploading;

  return (
    <div style={{ direction: 'rtl' }}>
      {/* Drop Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        style={{
          border: `2px dashed ${dragActive ? '#3b82f6' : error ? '#dc2626' : borderColor}`,
          borderRadius: '16px',
          padding: '40px 20px',
          textAlign: 'center',
          cursor: 'pointer',
          background: dragActive ? 'rgba(59,130,246,0.05)' : bgColor,
          transition: 'all 0.3s ease',
          marginBottom: '15px',
          opacity: uploading ? 0.6 : 1,
          pointerEvents: uploading ? 'none' : 'auto',
        }}
      >
        {uploading ? (
          <div>
            <Loader size={40} style={{ color: '#3b82f6', animation: 'spin 1s linear infinite', marginBottom: '12px' }} />
            <p style={{ fontWeight: 600, color: '#3b82f6' }}>{t.uploading}</p>
            <div style={{
              width: '100%',
              maxWidth: '300px',
              height: '6px',
              background: darkMode ? '#334155' : '#e2e8f0',
              borderRadius: '3px',
              margin: '12px auto 0',
              overflow: 'hidden',
            }}>
              <div style={{
                width: `${uploadProgress}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #3b82f6, #10b981)',
                borderRadius: '3px',
                transition: 'width 0.5s ease',
              }} />
            </div>
          </div>
        ) : isUploaded ? (
          <div>
            <CheckCircle size={40} style={{ color: '#059669', marginBottom: '12px' }} />
            <p style={{ fontWeight: 600, color: '#059669' }}>
              {t.uploaded} ({uploadedFiles.length})
            </p>
          </div>
        ) : (
          <>
            <Upload size={40} style={{ color: dragActive ? '#3b82f6' : textColor, marginBottom: '12px' }} />
            <p style={{ fontWeight: 600, color: darkMode ? '#e2e8f0' : '#475569', marginBottom: '8px' }}>
              {t.dragDrop}
            </p>
            <p style={{ color: textColor, fontSize: '0.9em' }}>
              {t.orClick} - {t.fileTypes} (الحد الأقصى {t.maxSize(type)})
            </p>
            {multiple && (
              <p style={{ color: textColor, fontSize: '0.8em', marginTop: '8px' }}>
                {t.maxFiles(maxFiles)}
              </p>
            )}
          </>
        )}
      </div>

      <input 
        ref={inputRef} 
        type="file" 
        accept="image/*" 
        multiple={multiple} 
        onChange={handleChange} 
        style={{ display: 'none' }} 
        disabled={uploading}
      />

      {/* Error Message */}
      {error && (
        <div style={{ 
          color: '#dc2626', 
          fontSize: '0.85rem', 
          marginBottom: '10px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '6px' 
        }}>
          <AlertCircle size={16} />{error}
        </div>
      )}

      {/* Preview Grid */}
      {previews.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
          gap: '10px',
          marginTop: '15px',
        }}>
          {previews.map((preview, index) => (
            <div key={index} style={{
              position: 'relative', borderRadius: '12px',
              overflow: 'hidden', height: '140px',
              border: `1px solid ${borderColor}`,
              background: darkMode ? '#0f172a' : '#f8fafc',
            }}>
              <img 
                src={preview} 
                alt={`${index + 1}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
              {uploadedFiles[index] && (
                <div style={{
                  position: 'absolute', top: '8px', left: '8px',
                  width: '24px', height: '24px', borderRadius: '50%',
                  background: '#059669', color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <CheckCircle size={14} />
                </div>
              )}
              <button
                onClick={(e) => { e.stopPropagation(); removeImage(index); }}
                disabled={uploading}
                style={{
                  position: 'absolute', top: '8px', right: '8px',
                  width: '26px', height: '26px', borderRadius: '50%',
                  background: 'rgba(220,38,38,0.9)', color: 'white',
                  border: 'none', cursor: uploading ? 'default' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  opacity: uploading ? 0.5 : 1,
                }}
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Manual Upload Button (when autoUpload is false) */}
      {!autoUpload && images.length > 0 && (
        <button
          onClick={handleManualUpload}
          disabled={uploading}
          style={{
            marginTop: '12px',
            padding: '10px 24px',
            borderRadius: '10px',
            background: uploading ? '#94a3b8' : '#3b82f6',
            color: 'white',
            border: 'none',
            fontWeight: 600,
            fontSize: '0.9rem',
            cursor: uploading ? 'not-allowed' : 'pointer',
            fontFamily: "'Cairo', sans-serif",
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            opacity: uploading ? 0.7 : 1,
          }}
        >
          {uploading ? <Loader size={16} className="animate-spin" /> : <Upload size={16} />}
          {uploading ? t.uploading : t.upload}
        </button>
      )}

      {/* Clear All Button */}
      {(previews.length > 0 || uploadedFiles.length > 0) && (
        <button
          onClick={clearAll}
          style={{
            marginTop: '8px',
            padding: '6px 16px',
            borderRadius: '8px',
            background: 'transparent',
            color: '#dc2626',
            border: `1px solid #dc2626`,
            fontWeight: 500,
            fontSize: '0.8rem',
            cursor: 'pointer',
            fontFamily: "'Cairo', sans-serif",
          }}
        >
          <X size={14} style={{ display: 'inline', marginRight: '4px' }} />
          إزالة الكل
        </button>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default ImageUploader;