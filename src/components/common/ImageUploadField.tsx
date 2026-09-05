import React, { useState, useRef, useCallback } from 'react';
import { 
  Upload, 
  Image as ImageIcon, 
  Link2, 
  X, 
  Trash2, 
  RefreshCw, 
  AlertCircle, 
  Sparkles, 
  FileImage,
  Check
} from 'lucide-react';

export interface PresetImageOption {
  name: string;
  url: string;
}

interface ImageUploadFieldProps {
  value?: string;
  onChange: (value: string) => void;
  label?: string;
  sublabel?: string;
  placeholderText?: string;
  presetOptions?: PresetImageOption[];
  fallbackText?: string;
  previewShape?: 'rounded' | 'square' | 'circle';
  maxSizeBytes?: number; // default 5MB
}

export const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
  value,
  onChange,
  label = 'Upload Image / Logo',
  sublabel = 'Drag and drop or click to upload (PNG, JPG, SVG, WebP up to 5MB)',
  placeholderText = 'https://example.com/logo.svg',
  presetOptions,
  fallbackText = 'IMG',
  previewShape = 'rounded',
  maxSizeBytes = 5 * 1024 * 1024, // 5MB
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'url'>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [urlInput, setUrlInput] = useState(value && !value.startsWith('data:') ? value : '');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const shapeClass = 
    previewShape === 'circle' 
      ? 'rounded-full' 
      : previewShape === 'square' 
      ? 'rounded-none' 
      : 'rounded-xl';

  // Process a selected or dropped file
  const handleFileProcess = useCallback((file: File) => {
    setUploadError(null);

    // Validate type
    if (!file.type.startsWith('image/') && !file.name.endsWith('.svg')) {
      setUploadError('Please select a valid image file (PNG, JPG, SVG, WebP, GIF).');
      return;
    }

    // Validate size
    if (file.size > maxSizeBytes) {
      const maxMb = Math.round(maxSizeBytes / (1024 * 1024));
      setUploadError(`File size is ${(file.size / (1024 * 1024)).toFixed(1)}MB. Maximum allowed size is ${maxMb}MB.`);
      return;
    }

    setIsLoading(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        setImgError(false);
        onChange(result);
      }
      setIsLoading(false);
    };

    reader.onerror = () => {
      setUploadError('Failed to read the image file. Please try again.');
      setIsLoading(false);
    };

    reader.readAsDataURL(file);
  }, [maxSizeBytes, onChange]);

  // Drag and Drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only reset if left the container itself
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handleFileProcess(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      handleFileProcess(file);
    }
    // reset input value so re-uploading same file name triggers change
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUrlSubmit = () => {
    if (!urlInput.trim()) {
      onChange('');
      return;
    }
    setImgError(false);
    setUploadError(null);
    onChange(urlInput.trim());
  };

  const handleClear = () => {
    onChange('');
    setUrlInput('');
    setImgError(false);
    setUploadError(null);
  };

  const hasImage = Boolean(value && value.trim() && !imgError);

  return (
    <div className="space-y-2">
      {/* Label and Sublabel */}
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            {label}
          </label>
          {sublabel && (
            <p className="text-[11px] text-slate-400 mt-0.5">{sublabel}</p>
          )}
        </div>

        {/* Input Mode Selector */}
        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[11px]">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`px-2 py-0.5 rounded-md font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
              activeTab === 'upload'
                ? 'bg-white text-blue-700 shadow-2xs font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Upload className="w-3 h-3" />
            <span>Upload File</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('url')}
            className={`px-2 py-0.5 rounded-md font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
              activeTab === 'url'
                ? 'bg-white text-blue-700 shadow-2xs font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Link2 className="w-3 h-3" />
            <span>Image URL</span>
          </button>
        </div>
      </div>

      {/* Hidden native file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Main Upload / URL Interaction Box */}
      {activeTab === 'upload' ? (
        <div
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed transition-all duration-200 p-4 text-center cursor-pointer rounded-2xl flex flex-col items-center justify-center gap-2 select-none ${
            isDragging
              ? 'border-blue-500 bg-blue-50/80 ring-4 ring-blue-500/20 scale-[1.01]'
              : hasImage
              ? 'border-slate-200 bg-slate-50/70 hover:bg-slate-50 hover:border-slate-300'
              : 'border-slate-300 bg-slate-50/50 hover:bg-blue-50/40 hover:border-blue-400'
          }`}
        >
          {isLoading ? (
            <div className="py-3 flex flex-col items-center gap-2">
              <RefreshCw className="w-6 h-6 text-blue-600 animate-spin" />
              <p className="text-xs font-semibold text-slate-600">Processing image file...</p>
            </div>
          ) : hasImage ? (
            <div className="w-full flex items-center justify-between gap-4 px-2" onClick={e => e.stopPropagation()}>
              <div className="flex items-center gap-3">
                <div className={`w-14 h-14 bg-white border border-slate-200 shadow-2xs p-1.5 flex items-center justify-center shrink-0 overflow-hidden ${shapeClass}`}>
                  <img
                    src={value}
                    alt="Uploaded thumbnail"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain"
                    onError={() => setImgError(true)}
                  />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-800">Custom Image Active</span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-0.5">
                      <Check className="w-2.5 h-2.5" /> Ready
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {value?.startsWith('data:') ? 'Local file uploaded' : 'Online image linked'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="px-2.5 py-1 text-xs font-bold text-blue-600 hover:bg-blue-100/70 bg-blue-50 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Replace</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClear();
                  }}
                  className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  title="Remove image"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="py-2 flex flex-col items-center">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors mb-2 ${
                isDragging ? 'bg-blue-600 text-white shadow-md' : 'bg-blue-50 text-blue-600'
              }`}>
                <Upload className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-slate-700">
                {isDragging ? 'Drop your image file here' : 'Click to browse or drag & drop image'}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Supports PNG, JPG, WebP, SVG (Square or transparent recommended)
              </p>
            </div>
          )}
        </div>
      ) : (
        /* Image URL Input Tab */
        <div className="space-y-2">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Link2 className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder={placeholderText}
                value={urlInput}
                onChange={e => setUrlInput(e.target.value)}
                onBlur={handleUrlSubmit}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleUrlSubmit();
                  }
                }}
                className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
            <button
              type="button"
              onClick={handleUrlSubmit}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shrink-0"
            >
              Apply
            </button>
          </div>

          {/* URL Thumbnail preview */}
          {hasImage && (
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className={`w-9 h-9 bg-white border border-slate-200 p-1 flex items-center justify-center shrink-0 ${shapeClass}`}>
                  <img
                    src={value}
                    alt="Preview"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain"
                    onError={() => setImgError(true)}
                  />
                </div>
                <span className="text-xs text-slate-600 truncate font-mono">{value}</span>
              </div>
              <button
                type="button"
                onClick={handleClear}
                className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                title="Remove URL"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {uploadError && (
        <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2 font-medium">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Quick Presets if provided */}
      {presetOptions && presetOptions.length > 0 && (
        <div className="pt-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase tracking-wider">
              <Sparkles className="w-3 h-3 text-amber-500" /> Presets:
            </span>
            {presetOptions.map(preset => (
              <button
                key={preset.name}
                type="button"
                onClick={() => {
                  setImgError(false);
                  setUploadError(null);
                  onChange(preset.url);
                  setUrlInput(preset.url);
                }}
                className={`px-2 py-0.5 text-[10px] font-semibold rounded-md border transition-colors cursor-pointer flex items-center gap-1 ${
                  value === preset.url
                    ? 'bg-blue-50 border-blue-300 text-blue-700 font-bold'
                    : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                }`}
              >
                <span>{preset.name}</span>
                {value === preset.url && <Check className="w-2.5 h-2.5 text-blue-600" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
