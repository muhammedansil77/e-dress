'use client';

import React, { useState, useRef } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { ProductFormData } from '../../../types/product';
import {
  Image as ImageIcon,
  UploadCloud,
  Plus,
  Trash2,
  Star,
  Sparkles,
  Link2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { useToast } from '../../../components/ui/toast';

interface StepImagesProps {
  form: UseFormReturn<ProductFormData>;
}

const APPAREL_IMAGE_PRESETS = [
  { label: 'Red Maxi Dress', url: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&q=80' },
  { label: 'Blue Summer Sundress', url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80' },
  { label: 'Silk Kurti Set', url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80' },
  { label: 'Emerald Evening Gown', url: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800&q=80' },
  { label: 'White Summer Frock', url: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800&q=80' },
  { label: 'Casual Linen Shirt', url: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&q=80' },
  { label: 'Bohemian Floral Dress', url: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800&q=80' },
];

export const StepImages: React.FC<StepImagesProps> = ({ form }) => {
  const { setValue, watch } = form;
  const { success, warning, error: toastError } = useToast();

  const [urlInput, setUrlInput] = useState('');
  const [urlError, setUrlError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeInputTab, setActiveInputTab] = useState<'upload' | 'url'>('upload');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const images = watch('images') || [];

  // Compress & optimize high-res image client-side to prevent memory/payload bloat
  const optimizeImageFile = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      // If SVG or GIF, keep as standard data URL
      if (file.type === 'image/gif' || file.type === 'image/svg+xml') {
        const reader = new FileReader();
        reader.onload = (e) => resolve((e.target?.result as string) || '');
        reader.readAsDataURL(file);
        return;
      }

      const reader = new FileReader();
      reader.onload = (readerEvent) => {
        const img = new window.Image();
        img.onload = () => {
          const maxDim = 1600;
          let { width, height } = img;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const optimized = canvas.toDataURL('image/jpeg', 0.88);
            resolve(optimized);
          } else {
            resolve(readerEvent.target?.result as string);
          }
        };
        img.onerror = () => resolve(readerEvent.target?.result as string);
        img.src = readerEvent.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const processFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter((file) => file.type.startsWith('image/'));
    if (fileArray.length === 0) {
      toastError('Please select valid image files (JPG, PNG, WEBP, etc.)');
      return;
    }

    setIsProcessing(true);
    try {
      const optimizedUrls = await Promise.all(fileArray.map((f) => optimizeImageFile(f)));
      const newImages = [...images, ...optimizedUrls];
      setValue('images', newImages, { shouldValidate: true });
      success(`Added ${fileArray.length} photo${fileArray.length > 1 ? 's' : ''} to gallery!`);
    } catch (err) {
      toastError('Failed to process image file(s)');
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleAddUrlImage = (presetUrl?: string) => {
    const targetUrl = (presetUrl || urlInput).trim();
    setUrlError('');

    if (!targetUrl) {
      // If user clicked "Add Image" with empty URL input, launch file picker to help them!
      if (!presetUrl) {
        warning('Opening file browser to choose an image from your device...');
        fileInputRef.current?.click();
      }
      return;
    }

    // Validation for web links if entered manually
    if (!presetUrl && !targetUrl.startsWith('http://') && !targetUrl.startsWith('https://') && !targetUrl.startsWith('data:image/')) {
      setUrlError('URL must begin with https:// or http://');
      return;
    }

    if (images.includes(targetUrl)) {
      warning('This image is already in the product gallery');
      return;
    }

    setValue('images', [...images, targetUrl], { shouldValidate: true });
    setUrlInput('');
    success('Image added to gallery!');
  };

  const handleRemoveImage = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    setValue('images', updated, { shouldValidate: true });
  };

  const handleSetCover = (index: number) => {
    if (index === 0) return;
    const item = images[index];
    const filtered = images.filter((_, i) => i !== index);
    setValue('images', [item, ...filtered], { shouldValidate: true });
    success('Cover image updated!');
  };

  const handleMoveLeft = (index: number) => {
    if (index === 0) return;
    const newImages = [...images];
    const temp = newImages[index - 1];
    newImages[index - 1] = newImages[index];
    newImages[index] = temp;
    setValue('images', newImages, { shouldValidate: true });
  };

  const handleMoveRight = (index: number) => {
    if (index === images.length - 1) return;
    const newImages = [...images];
    const temp = newImages[index + 1];
    newImages[index + 1] = newImages[index];
    newImages[index] = temp;
    setValue('images', newImages, { shouldValidate: true });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-base font-bold text-coffee-900">Product Gallery & Media</h3>
        <p className="text-xs text-coffee-600">
          Upload photos from your computer, paste web URLs, or select apparel presets. The first image will be used as the primary storefront cover.
        </p>
      </div>

      {/* Hidden File Input for Native File Chooser */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/png,image/jpeg,image/jpg,image/webp,image/gif,image/avif"
        multiple
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Mode Switch Tabs */}
      <div className="flex border-b border-cream-400 gap-6">
        <button
          type="button"
          onClick={() => setActiveInputTab('upload')}
          className={`pb-2.5 text-xs font-bold transition-all flex items-center gap-2 border-b-2 ${
            activeInputTab === 'upload'
              ? 'border-coffee-700 text-coffee-900'
              : 'border-transparent text-coffee-600 hover:text-coffee-900'
          }`}
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload from Computer</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveInputTab('url')}
          className={`pb-2.5 text-xs font-bold transition-all flex items-center gap-2 border-b-2 ${
            activeInputTab === 'url'
              ? 'border-coffee-700 text-coffee-900'
              : 'border-transparent text-coffee-600 hover:text-coffee-900'
          }`}
        >
          <Link2 className="w-4 h-4" />
          <span>Image Web URL</span>
        </button>
      </div>

      {/* TAB 1: Upload from Computer (Drag & Drop + Browse) */}
      {activeInputTab === 'upload' && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
            isDragging
              ? 'border-gold-500 bg-cream-200/60 ring-4 ring-gold-500/20'
              : 'border-cream-400 bg-cream-100/50 hover:border-gold-500 hover:bg-cream-100'
          }`}
        >
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-cream-200 text-gold-600 border border-cream-300 flex items-center justify-center shadow-sm">
              {isProcessing ? (
                <Loader2 className="w-7 h-7 animate-spin" />
              ) : (
                <UploadCloud className="w-7 h-7" />
              )}
            </div>
            <div>
              <h4 className="text-sm font-bold text-coffee-900">
                {isProcessing ? 'Processing Images...' : 'Click to Browse or Drag & Drop Photos'}
              </h4>
              <p className="text-xs text-coffee-600 mt-1 max-w-sm mx-auto">
                Select high-definition dress photos from your device. Supports PNG, JPG, JPEG, WEBP (multiple files supported).
              </p>
            </div>
            <Button
              type="button"
              variant="primary"
              size="sm"
              isLoading={isProcessing}
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              className="mt-2"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              <span>Select Photos from Computer</span>
            </Button>
          </div>
        </div>
      )}

      {/* TAB 2: Image Web URL */}
      {activeInputTab === 'url' && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <ImageIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-coffee-600" />
              <input
                type="url"
                value={urlInput}
                onChange={(e) => {
                  setUrlInput(e.target.value);
                  if (urlError) setUrlError('');
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddUrlImage();
                  }
                }}
                placeholder="Paste high-res image URL (e.g. https://images.unsplash.com/...)"
                className={`w-full rounded-xl border py-2.5 pl-9 pr-3 text-xs text-coffee-900 placeholder:text-coffee-600/50 focus:outline-none focus:ring-2 shadow-sm ${
                  urlError
                    ? 'border-rose-600 focus:ring-rose-500'
                    : 'border-cream-400 bg-cream-50 focus:ring-gold-500/30 focus:border-gold-500'
                }`}
              />
            </div>
            <Button type="button" onClick={() => handleAddUrlImage()} variant="primary" size="sm">
              <Plus className="w-4 h-4" />
              <span>Add Image</span>
            </Button>
          </div>
          {urlError && (
            <p className="text-xs text-rose-700 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{urlError}</span>
            </p>
          )}
        </div>
      )}

      {/* Quick Fashion Apparel Presets */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold text-coffee-600 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-gold-500" />
            <span>Or click to add instant apparel sample presets:</span>
          </span>
          <span className="text-[11px] text-coffee-600">{images.length} added</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {APPAREL_IMAGE_PRESETS.map((preset) => {
            const isAdded = images.includes(preset.url);
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => handleAddUrlImage(preset.url)}
                disabled={isAdded}
                className={`text-[11px] font-medium px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 shadow-sm ${
                  isAdded
                    ? 'border-cream-400 bg-cream-200 text-coffee-800 opacity-90 cursor-default'
                    : 'border-cream-400 bg-cream-50 text-coffee-900 hover:border-gold-500 hover:bg-cream-100'
                }`}
              >
                {isAdded ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-gold-600" />
                ) : (
                  <Plus className="w-3.5 h-3.5 text-coffee-600" />
                )}
                <span>{preset.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold text-coffee-900 flex items-center gap-2">
            <span>Product Gallery</span>
            <span className="px-2 py-0.5 rounded-full bg-cream-200 border border-cream-300 text-[10px] font-mono text-coffee-700">
              {images.length} {images.length === 1 ? 'image' : 'images'}
            </span>
          </h4>
          {images.length > 1 && (
            <button
              type="button"
              onClick={() => setValue('images', [], { shouldValidate: true })}
              className="text-[11px] font-semibold text-rose-700 hover:text-rose-800 flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3 h-3" />
              <span>Remove All</span>
            </button>
          )}
        </div>

        {images.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {images.map((img, idx) => {
              const isCover = idx === 0;
              return (
                <div
                  key={img.substring(0, 40) + idx}
                  className={`group relative rounded-2xl overflow-hidden border bg-cream-200 aspect-[3/4] shadow-sm transition-all ${
                    isCover
                      ? 'border-gold-500 ring-2 ring-gold-500/40'
                      : 'border-cream-400 hover:border-gold-500/60'
                  }`}
                >
                  {/* Image Display */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img}
                    alt={`Product photo ${idx + 1}`}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as any).src =
                        'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&q=80';
                    }}
                  />

                  {/* Image Position Order Tag */}
                  <div className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-coffee-950/70 backdrop-blur-sm text-cream-50 text-[10px] font-mono">
                    #{idx + 1}
                  </div>

                  {/* Cover Badge or Set as Cover */}
                  {isCover ? (
                    <div className="absolute top-2 left-2 px-2.5 py-1 rounded-full bg-gold-500 text-coffee-950 text-[10px] font-extrabold tracking-wider uppercase shadow-md flex items-center gap-1">
                      <Star className="w-3 h-3 fill-coffee-950" />
                      <span>PRIMARY COVER</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSetCover(idx)}
                      className="absolute top-2 left-2 px-2 py-1 rounded-lg bg-coffee-950/70 hover:bg-gold-500 hover:text-coffee-950 text-cream-50 text-[10px] font-bold uppercase backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Make Cover
                    </button>
                  )}

                  {/* Order Arrows (Move Left / Move Right) */}
                  <div className="absolute bottom-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {idx > 0 && (
                      <button
                        type="button"
                        onClick={() => handleMoveLeft(idx)}
                        title="Move Earlier"
                        className="p-1 rounded bg-coffee-950/70 hover:bg-coffee-950 text-cream-50"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {idx < images.length - 1 && (
                      <button
                        type="button"
                        onClick={() => handleMoveRight(idx)}
                        title="Move Later"
                        className="p-1 rounded bg-coffee-950/70 hover:bg-coffee-950 text-cream-50"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    title="Delete Image"
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-rose-700 hover:bg-rose-800 text-cream-50 shadow opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="p-12 text-center border-2 border-dashed border-cream-400 rounded-2xl cursor-pointer hover:border-gold-500 transition-colors bg-cream-100/50"
          >
            <ImageIcon className="w-10 h-10 text-coffee-600/70 mx-auto mb-2" />
            <p className="text-xs font-bold text-coffee-900">No images added yet</p>
            <p className="text-[11px] text-coffee-600 mt-1 max-w-xs mx-auto">
              Click to choose photos from your computer or pick from the fashion presets above.
            </p>
            <Button type="button" variant="outline" size="sm" className="mt-3 pointer-events-none">
              <UploadCloud className="w-3.5 h-3.5 mr-1" />
              <span>Browse Device Photos</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
