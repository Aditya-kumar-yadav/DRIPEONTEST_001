import React, { useState, useEffect } from 'react';
import { ImageOff, Sparkles } from 'lucide-react';

export interface ImageSource {
  srcSet: string;
  type?: string;   // e.g., 'image/avif', 'image/webp'
  media?: string;  // e.g., '(max-width: 640px)', '(min-width: 1024px)'
}

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackText?: string;
  containerClassName?: string;
  sources?: ImageSource[];
  width?: string | number;
  height?: string | number;
  loading?: 'lazy' | 'eager';
  fetchPriority?: 'high' | 'low' | 'auto';
  aspectRatio?: string; // e.g. "aspect-[4/5]"
}

export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt,
  className = '',
  fallbackText = 'LOOKBOOK UNSTABLE',
  containerClassName = '',
  sources,
  width,
  height,
  loading = 'lazy',
  fetchPriority = 'auto',
  aspectRatio = 'aspect-[4/5]',
  ...props
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);

  // Reset loading and error states if src changes
  useEffect(() => {
    if (src) {
      setIsLoading(true);
      setHasError(false);

      // Pre-check if image is already cached/complete to prevent infinite spinner
      const img = new Image();
      img.src = src;
      if (img.complete) {
        setIsLoading(false);
      }
    } else {
      setHasError(true);
      setIsLoading(false);
    }
  }, [src]);

  // 1. Error Fallback - Branded Luxury Aesthetic
  if (hasError || !src) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-white border border-neutral-900 rounded-xl p-6 text-center select-none ${aspectRatio} ${containerClassName}`}
        style={{
          ...(width !== undefined ? { width: typeof width === 'number' ? `${width}px` : width } : {}),
          ...(height !== undefined ? { height: typeof height === 'number' ? `${height}px` : height } : {}),
        }}
        id="safe-image-placeholder-root"
      >
        <div className="p-3.5 bg-[#0d0d0d] rounded-full border border-neutral-800 mb-3 hover:border-neutral-700/60 transition-colors">
          <ImageOff size={18} className="text-red-600/50" />
        </div>
        <div className="space-y-1">
          <p className="text-[10px] font-medium tracking-[0.2em] text-red-600 uppercase font-bold cursor-default">
            {fallbackText}
          </p>
          <p className="text-[8px] font-medium text-neutral-500 uppercase tracking-widest cursor-default">
            Store Archive System
          </p>
        </div>
      </div>
    );
  }

  // 2. Base layout inline Styles targeting Cumulative Layout Shift (CLS)
  const containerStyle: React.CSSProperties = {
    position: 'relative',
    overflow: 'hidden',
    ...(width !== undefined ? { width: typeof width === 'number' ? `${width}px` : width } : {}),
    ...(height !== undefined ? { height: typeof height === 'number' ? `${height}px` : height } : {}),
  };

  const hasObjectFit = className.includes('object-cover') ||
    className.includes('object-contain') ||
    className.includes('object-fill') ||
    className.includes('object-none') ||
    className.includes('object-scale-down');
  const fitClass = hasObjectFit ? '' : 'object-cover';

  // 3. Complete Image rendering logic
  const imageElement = (
    <img
      src={src}
      alt={alt || 'DRIPEON Luxury Silhouette'}
      onLoad={() => setIsLoading(false)}
      onError={() => {
        setIsLoading(false);
        setHasError(true);
      }}
      width={width}
      height={height}
      loading={loading}
      className={`w-full h-full ${fitClass} transform duration-700 ease-out-expo
        ${isLoading ? 'opacity-0 scale-102' : 'opacity-100 scale-100'} 
        ${className}`}
      referrerPolicy="no-referrer"
      {...(fetchPriority !== 'auto' ? { fetchpriority: fetchPriority } : {})}
      {...props}
    />
  );

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-[#0e0e0e] border border-red-600/15 hover:border-red-600/45 transition-all duration-500 gold-sweep-container ${aspectRatio} ${containerClassName}`}
      style={containerStyle}
      id="safe-image-wrapper"
    >
      {/* Premium Shimmer Skeleton State - Conditionally Unmounts when isLoading is false */}
      {isLoading && (
        <div className="absolute inset-0 z-10 animate-shimmer overflow-hidden flex flex-col justify-between p-6 select-none">
          {/* Subtle Top Indicator branding */}
          <div className="flex items-center justify-between opacity-30">
            <Sparkles size={11} className="text-red-600" />
            <span className="text-[7px] font-medium tracking-widest text-red-600 uppercase font-bold">
              HYDRATING
            </span>
          </div>

          {/* Minimalist Bottom Brand Details for the Premium Aesthetic feel */}
          <div className="space-y-1.5 opacity-20">
            <div className="h-2 w-16 bg-neutral-700 rounded"></div>
            <div className="h-1.5 w-10 bg-neutral-850 rounded"></div>
          </div>
        </div>
      )}

      {/* Picture standard container for Multi-format responsive source options */}
      {sources && sources.length > 0 ? (
        <picture className="w-full h-full">
          {sources.map((source, index) => (
            <source
              key={index}
              srcSet={source.srcSet}
              type={source.type}
              media={source.media}
            />
          ))}
          {imageElement}
        </picture>
      ) : (
        imageElement
      )}
    </div>
  );
};
