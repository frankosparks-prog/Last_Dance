'use client';

import React, { useState, useRef } from 'react';
import axios from 'axios';
import { 
  UploadCloud, 
  Image as ImageIcon, 
  Sparkles, 
  Link as LinkIcon, 
  Check, 
  AlertCircle, 
  RefreshCw, 
  X, 
  Cloud,
  CheckCircle2,
  Camera
} from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const DEFAULT_PRESETS = [
  { url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=85', label: 'Glamour' },
  { url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=85', label: 'Classic' },
  { url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop&q=85', label: 'Chic' },
  { url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800&auto=format&fit=crop&q=85', label: 'Style' },
  { url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&auto=format&fit=crop&q=85', label: 'Vibe' }
];

export default function CloudinaryImageUpload({
  value = '',
  onChange,
  presets = DEFAULT_PRESETS,
  folder = 'last_dance_candidates',
  label = 'Candidate Portrait / Avatar'
}) {
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'presets' | 'url'
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [urlInput, setUrlInput] = useState(value || '');

  const fileInputRef = useRef(null);

  const processUpload = async (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (JPEG, PNG, WEBP, or GIF).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError('Image size exceeds 10MB limit. Please select a smaller photo.');
      return;
    }

    setUploading(true);
    setUploadProgress(15);
    setUploadError('');

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('folder', folder);

      const res = await axios.post(`${API_BASE_URL}/last-dance/upload-image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 90) / progressEvent.total);
            setUploadProgress(percent);
          }
        }
      });

      if (res.data.success && res.data.url) {
        setUploadProgress(100);
        onChange(res.data.url);
        setUrlInput(res.data.url);
      } else {
        throw new Error(res.data.message || 'Upload failed.');
      }
    } catch (err) {
      console.warn('[CloudinaryUpload] Multipart upload issue, falling back to base64 encoding...', err.message);
      
      // Fallback: Upload as Base64 string in case of proxy/multipart restrictions
      try {
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const base64Data = e.target.result;
            const res = await axios.post(`${API_BASE_URL}/last-dance/upload-image`, {
              image: base64Data,
              folder
            });
            if (res.data.success && res.data.url) {
              setUploadProgress(100);
              onChange(res.data.url);
              setUrlInput(res.data.url);
            } else {
              setUploadError(res.data.message || 'Failed to upload photo.');
            }
          } catch (innerErr) {
            setUploadError(innerErr.response?.data?.message || 'Upload error. Please try again or paste image URL.');
          } finally {
            setUploading(false);
          }
        };
        reader.readAsDataURL(file);
        return;
      } catch (readErr) {
        setUploadError(err.response?.data?.message || 'Failed to process image file.');
      }
    } finally {
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
      }, 400);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processUpload(e.target.files[0]);
    }
  };

  const handleApplyUrl = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
      setUploadError('');
    }
  };

  return (
    <div className="space-y-4">
      {/* Header and Source Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <label className="block text-[13px] font-semibold text-slate-900">
            {label}
          </label>
          <p className="text-[11px] text-slate-500">
            Upload a portrait from your device, select a curated preset, or link a web photo.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="inline-flex rounded-xl bg-slate-100 p-1 text-[11px] font-medium text-slate-600 border border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition ${
              activeTab === 'upload'
                ? 'bg-white text-slate-950 font-bold shadow-xs'
                : 'hover:text-slate-950'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5 text-rose-500" />
            <span>Upload Photo</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('presets')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition ${
              activeTab === 'presets'
                ? 'bg-white text-slate-950 font-bold shadow-xs'
                : 'hover:text-slate-950'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Presets</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('url')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition ${
              activeTab === 'url'
                ? 'bg-white text-slate-950 font-bold shadow-xs'
                : 'hover:text-slate-950'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5 text-blue-500" />
            <span>Image URL</span>
          </button>
        </div>
      </div>

      {/* Error Message Alert */}
      {uploadError && (
        <div className="flex items-center space-x-2 rounded-xl bg-rose-50 border border-rose-200 px-3.5 py-2.5 text-xs text-rose-700">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span className="flex-1 font-medium">{uploadError}</span>
          <button
            type="button"
            onClick={() => setUploadError('')}
            className="text-rose-400 hover:text-rose-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* TAB 1: UPLOAD TO CLOUDINARY */}
      {activeTab === 'upload' && (
        <div className="space-y-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleFileChange}
            className="hidden"
          />

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !uploading && fileInputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 ${
              isDragOver
                ? 'border-rose-500 bg-rose-50/50 scale-[1.01]'
                : 'border-slate-300 hover:border-slate-400 bg-slate-50/60 hover:bg-slate-50'
            } ${uploading ? 'pointer-events-none opacity-80' : ''}`}
          >
            {uploading ? (
              <div className="space-y-3 py-4">
                <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto animate-spin">
                  <RefreshCw className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    Uploading portrait photo...
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">Optimizing photo quality</p>
                </div>
                <div className="w-48 mx-auto bg-slate-200 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-rose-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.max(uploadProgress, 20)}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2.5">
                <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 text-rose-600 flex items-center justify-center mx-auto shadow-xs group-hover:scale-105 transition">
                  <Camera className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    <span className="text-rose-600 hover:underline">Click to upload portrait</span> or drag and drop here
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Supports high-res JPG, PNG, WEBP up to 10MB
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: CURATED PRESETS */}
      {activeTab === 'presets' && (
        <div>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            {presets.map((item) => {
              const selected = value === item.url;
              return (
                <button
                  key={item.url}
                  type="button"
                  onClick={() => {
                    onChange(item.url);
                    setUrlInput(item.url);
                  }}
                  className="group text-left focus:outline-none"
                >
                  <div
                    className={`relative aspect-square w-full rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                      selected
                        ? 'border-rose-600 ring-2 ring-rose-500/30 scale-[1.02]'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <img
                      src={item.url}
                      alt={item.label}
                      className="h-full w-full object-cover object-center group-hover:scale-105 transition duration-300"
                    />
                    {selected && (
                      <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px] font-bold shadow-sm">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </div>
                  <p className={`mt-1.5 text-[11px] font-medium text-center ${selected ? 'text-rose-600 font-bold' : 'text-slate-600'}`}>
                    {item.label}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: IMAGE WEB URL */}
      {activeTab === 'url' && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="url"
              placeholder="https://images.unsplash.com/photo-..."
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="flex-1 px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-rose-500 transition"
            />
            <button
              type="button"
              onClick={handleApplyUrl}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shrink-0"
            >
              Apply
            </button>
          </div>
          <p className="text-[11px] text-slate-400">
            Paste any direct HTTPS image link to use as the candidate photo.
          </p>
        </div>
      )}

      {/* CURRENT SELECTION PREVIEW BAR */}
      {value && (
        <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-2xl">
          <div className="flex items-center space-x-3 min-w-0">
            <img
              src={value}
              alt="Avatar Preview"
              className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
            />
            <div className="min-w-0 text-xs">
              <div className="flex items-center space-x-1.5 font-bold text-slate-800">
                <span>Selected Avatar</span>
                {value && (
                  <span className="inline-flex items-center space-x-1 bg-emerald-50 text-emerald-700 text-[10px] px-2 py-0.5 rounded-full font-medium border border-emerald-200/60">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Photo Attached</span>
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 truncate max-w-xs">{value}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              fileInputRef.current?.click();
            }}
            className="text-[11px] font-bold text-rose-600 hover:text-rose-700 px-2 py-1 rounded-lg hover:bg-rose-50 transition"
          >
            Change
          </button>
        </div>
      )}
    </div>
  );
}
