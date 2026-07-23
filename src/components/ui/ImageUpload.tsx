'use client';
import { useRef, useState } from 'react';
import { Upload, Camera, Link, X, Image as ImageIcon, Check } from 'lucide-react';
import { fileApi } from '@/lib/api';
import toast from 'react-hot-toast';

interface Props {
  label: string;
  folder: string;
  currentUrl?: string | null;
  onUploaded: (url: string) => void;
  aspectRatio?: 'square' | 'wide';
}

export default function ImageUpload({ label, folder, currentUrl, onUploaded, aspectRatio = 'square' }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [urlMode, setUrlMode] = useState(false);
  const [urlInput, setUrlInput] = useState('');

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image must be under 10 MB');
      return;
    }
    setPreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      const url = await fileApi.uploadImage(file, folder);
      onUploaded(url);
      toast.success(`${label} uploaded`);
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? 'Upload failed');
      setPreview(null);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
      if (cameraRef.current) cameraRef.current.value = '';
    }
  };

  const handleUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    if (!/^https?:\/\/.+/.test(trimmed)) {
      toast.error('Please enter a valid URL starting with http:// or https://');
      return;
    }
    setPreview(null);
    onUploaded(trimmed);
    setUrlMode(false);
    setUrlInput('');
    toast.success(`${label} set`);
  };

  const handleRemove = () => {
    setPreview(null);
    setUrlInput('');
    setUrlMode(false);
    onUploaded('');
  };

  const displayUrl = preview ?? currentUrl;

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-gray-600">{label}</p>

      {/* Preview */}
      <div className={`relative rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 overflow-hidden ${aspectRatio === 'wide' ? 'h-32 w-full' : 'h-32 w-32'}`}>
        {displayUrl ? (
          <img src={displayUrl} alt={label} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
            <ImageIcon className="h-8 w-8 mb-1" />
            <span className="text-[10px]">No image</span>
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <div className="h-5 w-5 border-2 border-[#1B8C4E] border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {displayUrl && !uploading && (
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-1.5 right-1.5 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 flex-wrap">
        <button
          type="button"
          disabled={uploading}
          onClick={() => { setUrlMode(false); fileRef.current?.click(); }}
          className="flex items-center gap-1.5 bg-[#1B8C4E] text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-[#146B3A] transition-colors disabled:opacity-50"
        >
          <Upload className="h-3.5 w-3.5" />
          Upload
        </button>
        <button
          type="button"
          disabled={uploading}
          onClick={() => { setUrlMode(false); cameraRef.current?.click(); }}
          className="flex items-center gap-1.5 bg-[#1A1A2E] text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-[#2a2a4e] transition-colors disabled:opacity-50"
        >
          <Camera className="h-3.5 w-3.5" />
          Camera
        </button>
        <button
          type="button"
          onClick={() => setUrlMode((v) => !v)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${urlMode ? 'bg-gray-200 text-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          <Link className="h-3.5 w-3.5" />
          Paste URL
        </button>
      </div>

      {/* URL input */}
      {urlMode && (
        <div className="flex gap-2">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleUrl()}
            placeholder="https://example.com/image.jpg"
            className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#1B8C4E]"
            autoFocus
          />
          <button
            type="button"
            onClick={handleUrl}
            className="bg-[#1B8C4E] text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-[#146B3A] transition-colors"
          >
            <Check className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Hidden file inputs */}
      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFile} />
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFile} />
    </div>
  );
}
