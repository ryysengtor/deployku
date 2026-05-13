'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, File, Loader2 } from 'lucide-react';

interface FileUploadProps {
  subdirectory: 'products' | 'banners' | 'logos' | 'favicons' | 'files';
  accept?: string;
  label?: string;
  value: string;
  onChange: (url: string) => void;
  preview?: boolean;
}

export default function FileUpload({
  subdirectory,
  accept = 'image/png,image/jpeg,image/webp,application/zip,application/pdf',
  label = 'Upload File',
  value,
  onChange,
  preview = true,
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isImage = (url: string) => {
    return /\.(png|jpg|jpeg|webp|gif|svg)$/i.test(url);
  };

  const uploadFile = useCallback(async (file: File) => {
    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setError('File terlalu besar! Maksimal 10MB');
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('subdirectory', subdirectory);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        onChange(data.data.url);
      } else {
        setError(data.error || 'Gagal upload file');
      }
    } catch {
      setError('Gagal upload file. Coba lagi.');
    } finally {
      setIsUploading(false);
    }
  }, [subdirectory, onChange]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleClear = () => {
    onChange('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-2">
      <label className="font-bold text-sm" style={{ color: 'var(--foreground)' }}>
        {label}
      </label>

      {/* Preview of current file */}
      {value && (
        <div
          className="relative rounded-xl overflow-hidden"
          style={{ background: 'var(--muted)', border: '3px solid var(--foreground)' }}
        >
          {preview && isImage(value) ? (
            <div className="relative">
              <img
                src={value}
                alt="Preview"
                className="w-full h-40 object-cover"
              />
              <button
                onClick={handleClear}
                className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center"
                style={{ background: 'var(--destructive)', color: 'white', border: '2px solid var(--foreground)' }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-3">
              <File className="w-8 h-8" style={{ color: 'var(--primary)' }} />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm truncate" style={{ color: 'var(--foreground)' }}>
                  {value.split('/').pop()}
                </p>
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>File terupload</p>
              </div>
              <button
                onClick={handleClear}
                className="w-7 h-7 rounded-full flex items-center justify-center"
                style={{ background: 'var(--destructive)', color: 'white', border: '2px solid var(--foreground)' }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Drop zone */}
      <div
        onClick={() => !isUploading && fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className="relative cursor-pointer rounded-xl p-6 text-center transition-all"
        style={{
          background: isDragging ? 'var(--accent)' : 'var(--muted)',
          border: `3px dashed ${isDragging ? 'var(--primary)' : 'var(--foreground)'}`,
          opacity: isUploading ? 0.6 : 1,
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
        />

        {isUploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--primary)' }} />
            <p className="font-bold text-sm" style={{ color: 'var(--foreground)' }}>Mengupload...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            {preview ? (
              <ImageIcon className="w-8 h-8" style={{ color: 'var(--primary)' }} />
            ) : (
              <Upload className="w-8 h-8" style={{ color: 'var(--primary)' }} />
            )}
            <p className="font-bold text-sm" style={{ color: 'var(--foreground)' }}>
              {isDragging ? 'Lepaskan file di sini' : 'Klik atau drag & drop'}
            </p>
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
              PNG, JPG, WEBP, ZIP, PDF (Max 10MB)
            </p>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <p className="text-xs font-bold" style={{ color: 'var(--destructive)' }}>{error}</p>
      )}
    </div>
  );
}
