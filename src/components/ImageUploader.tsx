import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, CheckSquare, Loader2, AlertCircle, Plus, Image as ImageIcon, Wand2 } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import { useAuth, useUser } from '@clerk/clerk-react';

declare global {
  interface Window {
    Clerk?: any;
  }
}

interface ImageUploaderProps {
  onFileSelect?: (url: string | null) => void; // For single-upload consumer (e.g. reviews)
  onFilesChange?: (urls: string[]) => void;    // For multi-upload consumer (e.g. admin product creation)
  label?: string;
  multiple?: boolean;
  initialUrls?: string[];
}

interface UploadQueueItem {
  id: string;
  file: File;
  previewUrl: string;
  uploading: boolean;
  uploadedUrl: string | null;
  error: string | null;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onFileSelect,
  onFilesChange,
  label = "Insert Apparel Image",
  multiple = false,
  initialUrls = []
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [queue, setQueue] = useState<UploadQueueItem[]>([]);
  const [globalUrls, setGlobalUrls] = useState<string[]>(initialUrls);
  const { getToken } = useAuth();
  const { user } = useUser();

  // Synchronize initialUrls when they load in or change (essential for switching products, resetting, or updating the list)
  useEffect(() => {
    const initialStr = JSON.stringify(initialUrls || []);
    const globalStr = JSON.stringify(globalUrls || []);
    if (initialStr !== globalStr) {
      setGlobalUrls(initialUrls || []);

      if (!initialUrls || initialUrls.length === 0) {
        setQueue([]);
      } else {
        // Filter out completed items that are now present in initialUrls
        setQueue(prev => prev.filter(item => {
          if (item.uploadedUrl && initialUrls.includes(item.uploadedUrl)) {
            return false; // remove from queue as it is now in static globalUrls
          }
          return true; // keep uploading or failed items
        }));
      }
    }
  }, [initialUrls]);

  // Cleanup object URLs to avoid memory leaks
  useEffect(() => {
    return () => {
      queue.forEach((item) => {
        if (item.previewUrl.startsWith('blob:')) {
          URL.revokeObjectURL(item.previewUrl);
        }
      });
    };
  }, [queue]);

  const triggerFileExplorer = (e: React.MouseEvent) => {
    e.preventDefault();
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const uploadFileToCloudinary = async (file: File, itemId: string) => {
    let finalFile = file;

    try {
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        fileType: 'image/webp' as any
      };
      const compressedBlob = await imageCompression(file, options);
      
      // Fix: Repackage the Blob into a File so FormData preserves the filename and MIME type
      const newName = file.name.replace(/\.[^/.]+$/, "") + ".webp";
      finalFile = new File([compressedBlob], newName, { type: "image/webp" });
    } catch (e) {
      console.error("Compression failed, using original file", e);
    }

    const formData = new FormData();
    formData.append('image', finalFile);

    try {
      const token = await getToken();

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: token ? {
          'Authorization': `Bearer ${token}`,
          'X-User-Email': user?.primaryEmailAddress?.emailAddress || ''
        } : undefined,
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Store server rejected binary stream');
      }

      const data = await response.json();
      const secureUrl = data.imageUrl; // Fixed: Backend returns { imageUrl: ... }

      // Update item status in queue on successful upload
      setQueue(prevQueue => {
        const updated = prevQueue.map(item => {
          if (item.id === itemId) {
            return { ...item, uploading: false, uploadedUrl: secureUrl };
          }
          return item;
        });

        // Propagate result URLs to parent callback handlers
        const freshUploadedUrls = updated
          .map(item => item.uploadedUrl)
          .filter((url): url is string => !!url);

        const allUrls = [...globalUrls, ...freshUploadedUrls];

        if (multiple) {
          if (onFilesChange) onFilesChange(allUrls);
        } else {
          if (onFileSelect) onFileSelect(secureUrl);
        }

        return updated;
      });
    } catch (err: any) {
      console.error("[CLOUDINARY Store BRIDGE FAIL]", err);
      setQueue(prevQueue =>
        prevQueue.map(item => {
          if (item.id === itemId) {
            return {
              ...item,
              uploading: false,
              error: err.message || 'Stream upload failed'
            };
          }
          return item;
        })
      );
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);

    // If non-multiple mode, handle high-trust single swap
    if (!multiple) {
      const file = fileList[0];
      const localUrl = URL.createObjectURL(file);
      const uniqueId = `single-${Date.now()}`;

      // Cleanup previous blobs
      queue.forEach(item => {
        if (item.previewUrl.startsWith('blob:')) URL.revokeObjectURL(item.previewUrl);
      });

      const singleItem: UploadQueueItem = {
        id: uniqueId,
        file,
        previewUrl: localUrl,
        uploading: true,
        uploadedUrl: null,
        error: null
      };

      setQueue([singleItem]);
      await uploadFileToCloudinary(file, uniqueId);
    } else {
      // Multiple uploads
      const newItems = fileList.map(file => {
        const localUrl = URL.createObjectURL(file);
        const uniqueId = `multi-${Math.random().toString(36).substr(2, 9)}-${Date.now()}`;
        return {
          id: uniqueId,
          file,
          previewUrl: localUrl,
          uploading: true,
          uploadedUrl: null,
          error: null
        };
      });

      setQueue(prev => [...prev, ...newItems]);

      // Fire off paralleled uploads
      for (const item of newItems) {
        uploadFileToCloudinary(item.file, item.id);
      }
    }

    // Reset standard value so user can selection same file again later
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveQueueItem = (e: React.MouseEvent, itemId: string) => {
    e.preventDefault();
    e.stopPropagation();

    // Find the item to clean up its local object URL resource
    const targetItem = queue.find(item => item.id === itemId);
    if (targetItem && targetItem.previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(targetItem.previewUrl);
    }

    const nextQueue = queue.filter(item => item.id !== itemId);
    setQueue(nextQueue);

    const freshUploadedUrls = nextQueue
      .map(item => item.uploadedUrl)
      .filter((url): url is string => !!url);

    const allUrls = [...globalUrls, ...freshUploadedUrls];

    if (multiple) {
      if (onFilesChange) onFilesChange(allUrls);
    } else {
      if (onFileSelect) onFileSelect(null);
    }
  };

  const handleRemoveStaticUrl = (e: React.MouseEvent, url: string) => {
    e.preventDefault();
    e.stopPropagation();

    const nextUrls = globalUrls.filter(u => u !== url);
    setGlobalUrls(nextUrls);

    const activeQueueUrls = queue
      .map(item => item.uploadedUrl)
      .filter((u): u is string => !!u);

    const combined = [...nextUrls, ...activeQueueUrls];

    if (multiple) {
      if (onFilesChange) onFilesChange(combined);
    } else {
      if (onFileSelect) onFileSelect(null);
    }
  };

  return (
    <div 
      className="space-y-4" 
      id="custom-media-uploader-container"
      onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          const pseudoEvent = { target: { files: e.dataTransfer.files } } as any;
          handleFileChange(pseudoEvent);
        }
      }}
    >
      {/* Visual Hidden Input with restricted mimetype selection */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        multiple={multiple}
        className="sr-only font-medium"
        id="hidden-lookbook-input"
      />

      {/* Drag & Drop trigger option button */}
      <div 
        onClick={triggerFileExplorer}
        className="group flex flex-col items-center justify-center gap-3 w-full min-h-[140px] p-6 bg-[#121212] hover:bg-[#1a1a1a] border-2 border-dashed border-neutral-700 hover:border-red-600 rounded-2xl transition-all duration-300 cursor-pointer select-none text-neutral-400 hover:text-white"
      >
        <div className="flex items-center gap-2">
          {multiple ? (
            <Plus size={24} className="text-red-600 transition-transform group-hover:rotate-90 duration-300" />
          ) : (
            <Camera size={24} className="text-red-600 transition-transform group-hover:scale-110" />
          )}
          <span className="font-bold text-sm tracking-wider uppercase">{label || "Click or Drag to Upload"}</span>
        </div>
        <span className="text-[10px] font-medium text-neutral-500 uppercase tracking-widest">
          {multiple ? "Drop multiple images here" : "Drop an image here"}
        </span>
      </div>

      {/* Previews grid of both active uploading queue and already synced urls */}
      {(globalUrls.length > 0 || queue.length > 0) && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-white border border-red-600/10 rounded-2xl animate-fade-in" id="preview-grid-container">

          {/* 1. Rendering static already-synced URLs */}
          {globalUrls.map((url, index) => (
            <div
              key={`static-${index}`}
              className="relative w-full h-32 rounded-lg overflow-hidden border border-red-600/20 bg-black/60 group"
            >
              <img
                src={url}
                alt="Uploaded collection look"
                className="w-full h-full object-cover rounded-lg transition-transform duration-500 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />

              {/* Corner deletion tag */}
              <button
                type="button"
                onClick={(e) => handleRemoveStaticUrl(e, url)}
                className="absolute top-2 right-2 w-6 h-6 bg-black/80 hover:bg-red-600/90 hover:scale-105 border border-red-600/15 rounded-full flex items-center justify-center text-gray-900 transition-all duration-250 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 cursor-pointer shadow-md"
                title="Remove image from collection"
              >
                <X size={12} />
              </button>

              <div className="absolute bottom-2 left-2 bg-black/85 border border-red-600/10 px-1.5 py-0.5 rounded text-[8px] font-medium tracking-widest text-red-600 uppercase">
                Active
              </div>
            </div>
          ))}

          {/* 2. Rendering the active loading/uploading files queue */}
          {queue.map((item) => (
            <div
              key={item.id}
              className="relative w-full h-32 rounded-lg overflow-hidden border border-red-600/15 bg-black/60 group"
            >
              <img
                src={item.previewUrl}
                alt="Selected view"
                className={`w-full h-full object-cover rounded-lg transition-opacity duration-300 ${item.uploading ? 'opacity-30 blur-xs' : 'opacity-100'}`}
              />

              {/* Status loader & progress flags */}
              {item.uploading ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 select-none cursor-default">
                  <Loader2 size={18} className="animate-spin text-red-600" />
                  <span className="text-[8px] font-medium uppercase text-red-600 tracking-widest mt-2">
                    Streaming...
                  </span>
                </div>
              ) : item.uploadedUrl ? (
                <div className="absolute top-2 left-2 bg-green-950/90 border border-green-500/20 px-1.5 py-0.5 rounded text-[8px] font-medium text-green-400 font-bold uppercase tracking-widest select-none cursor-default">
                  Synced
                </div>
              ) : null}

              {/* Error messages inside thumb frame structure */}
              {item.error && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-950/80 p-2 text-center select-none cursor-default">
                  <AlertCircle size={15} className="text-red-400 mb-1" />
                  <span className="text-[8px] font-medium uppercase text-red-300 font-semibold line-clamp-2">
                    Failed
                  </span>
                </div>
              )}

              {/* Corner deletion tag */}
              <button
                type="button"
                onClick={(e) => handleRemoveQueueItem(e, item.id)}
                className="absolute top-2 right-2 w-6 h-6 bg-black/80 hover:bg-red-600/90 hover:scale-105 border border-red-600/15 rounded-full flex items-center justify-center text-gray-900 transition-all duration-250 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 cursor-pointer shadow-md"
                title="Discard Look preview file"
              >
                <X size={12} />
              </button>
            </div>
          ))}

        </div>
      )}
    </div>
  );
};
