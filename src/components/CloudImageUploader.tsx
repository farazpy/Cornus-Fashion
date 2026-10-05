import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Cloud, 
  CheckCircle2, 
  AlertTriangle, 
  ExternalLink, 
  Copy, 
  Trash2, 
  Image as ImageIcon 
} from 'lucide-react';

interface CloudImageUploaderProps {
  label: string;
  sublabel?: string;
  value: string;
  onChange: (url: string) => void;
  required?: boolean;
  adminPin: string;
  showToast: (msg: string) => void;
  cloudWorkspaceId?: string;
  placeholder?: string;
  aspectRatio?: 'portrait' | 'square' | 'wide';
}

export const CloudImageUploader: React.FC<CloudImageUploaderProps> = ({
  label,
  sublabel,
  value,
  onChange,
  required = false,
  adminPin,
  showToast,
  cloudWorkspaceId = '8',
  placeholder = 'https://s3.htknetwork/... or cloud direct link',
  aspectRatio = 'portrait'
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showManualInput, setShowManualInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadFile = async (file: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (JPG, PNG, WEBP, etc.)');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('workspace_id', cloudWorkspaceId || '8');
      formData.append('caption', `Uploaded for ${label} (${file.name})`);
      formData.append('file_name', file.name);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: {
          'x-admin-pin': adminPin
        },
        body: formData
      });

      const data = await res.json();
      if (data.success && (data.direct_link || data.file_url)) {
        const directLink = data.direct_link || data.file_url;
        onChange(directLink);
        showToast(`${label} uploaded directly to personal cloud!`);
      } else {
        const errorMsg = data.error || 'Failed to upload to personal cloud.';
        setUploadError(errorMsg);
        showToast(`Upload failed: ${errorMsg}`);
      }
    } catch (err: any) {
      const msg = err.message || 'Network error during upload.';
      setUploadError(msg);
      showToast(`Upload failed: ${msg}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleUploadFile(file);
    }
  };

  const aspectClass = 
    aspectRatio === 'square' ? 'aspect-square' :
    aspectRatio === 'wide' ? 'aspect-16/9' : 'aspect-3/4';

  return (
    <div className="space-y-1.5 text-xs">
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-zinc-700 font-bold">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
          {sublabel && <p className="text-[11px] text-zinc-400 font-normal">{sublabel}</p>}
        </div>

        <button
          type="button"
          onClick={() => setShowManualInput(!showManualInput)}
          className="text-[10px] text-zinc-500 hover:text-zinc-900 font-semibold cursor-pointer underline-offset-2 hover:underline"
        >
          {showManualInput ? 'Hide URL field' : 'Edit Direct URL'}
        </button>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        disabled={isUploading}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            handleUploadFile(file);
            e.target.value = '';
          }
        }}
      />

      {/* Upload & Preview Container */}
      {!value ? (
        // Empty state: Drag and drop / Click to upload
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-4 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2 ${
            isDragging 
              ? 'border-zinc-900 bg-zinc-100/80 scale-[1.01]' 
              : 'border-zinc-200 hover:border-zinc-400 bg-zinc-50/60 hover:bg-zinc-50'
          }`}
        >
          {isUploading ? (
            <div className="py-3 flex flex-col items-center gap-2">
              <div className="w-6 h-6 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-bold text-zinc-800">Uploading to Personal Cloud...</p>
              <p className="text-[10px] text-zinc-400">Dispatching asset and storing direct link in MySQL</p>
            </div>
          ) : (
            <>
              <div className="w-10 h-10 rounded-full bg-white shadow-2xs border border-zinc-200/80 flex items-center justify-center text-zinc-700">
                <Cloud className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-zinc-800">
                  Click to upload or drag & drop image
                </p>
                <p className="text-[10px] text-zinc-400 mt-0.5">
                  Stores directly on personal cloud storage and serves instantly
                </p>
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] font-mono text-zinc-500 bg-white px-2 py-0.5 rounded border border-zinc-200">
                <Upload className="w-3 h-3 text-zinc-400" />
                JPG, PNG, WEBP, AVIF up to 50MB
              </span>
            </>
          )}
        </div>
      ) : (
        // Populated state: Active Preview with Controls
        <div className="bg-white border border-zinc-200 rounded-xl p-3 shadow-2xs space-y-2">
          <div className="flex items-start gap-3">
            {/* Image Thumbnail */}
            <div className={`w-20 sm:w-24 shrink-0 rounded-lg overflow-hidden bg-zinc-100 border border-zinc-200 relative group ${aspectClass}`}>
              <img
                src={value}
                alt={label}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback visual if preview fails to render
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                <a
                  href={value}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 bg-white text-zinc-900 rounded-md hover:bg-zinc-100 transition-colors shadow-xs"
                  title="Open high-res in new tab"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Details & Actions */}
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Personal Cloud Direct Link
                </span>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(value);
                      showToast('Direct cloud link copied to clipboard!');
                    }}
                    className="p-1.5 hover:bg-zinc-100 rounded-lg text-zinc-500 hover:text-zinc-900 transition-colors cursor-pointer"
                    title="Copy direct link"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <a
                    href={value}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 hover:bg-zinc-100 rounded-lg text-zinc-500 hover:text-zinc-900 transition-colors"
                    title="Open direct file in new tab"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <button
                    type="button"
                    onClick={() => onChange('')}
                    className="p-1.5 hover:bg-red-50 rounded-lg text-zinc-400 hover:text-red-600 transition-colors cursor-pointer"
                    title="Remove image"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* URL preview */}
              <div className="bg-zinc-50 border border-zinc-200/80 rounded-lg px-2.5 py-1.5 text-[11px] font-mono text-zinc-600 truncate select-all">
                {value}
              </div>

              {/* Upload Replace Button */}
              <div className="flex items-center gap-2 pt-0.5">
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 bg-zinc-900 hover:bg-black text-white rounded-lg text-[11px] font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                >
                  <Upload className="w-3 h-3" />
                  <span>{isUploading ? 'Uploading New File...' : 'Replace from Device'}</span>
                </button>
                <span className="text-[10px] text-zinc-400">Stores new file in cloud</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manual URL Input (expandable if needed) */}
      {(showManualInput || (!value && showManualInput)) && (
        <div className="pt-1">
          <div className="relative">
            <input
              type="url"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              required={required && !value}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900 focus:bg-white focus:border-zinc-900 font-mono text-xs"
            />
            {value && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-emerald-600 font-semibold font-mono">
                Linked
              </span>
            )}
          </div>
          <span className="text-[10px] text-zinc-400 mt-1 block">
            Direct file URL served to visitors across the storefront.
          </span>
        </div>
      )}

      {/* Error state */}
      {uploadError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-2 text-[11px] text-red-700 flex items-start gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
          <span>{uploadError}</span>
        </div>
      )}
    </div>
  );
};
