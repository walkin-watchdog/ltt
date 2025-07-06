import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader, ArrowUp, ArrowDown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../ui/toaster';
import axios from 'axios';
import { ImageBrowser } from './ImageBrowser';

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
  folder?: string;
  title?: string;
  allowReordering?: boolean;
  className?: string;
}

export const ImageUploader = ({
  images = [],
  onChange,
  maxImages = 10,
  folder = 'products',
  title = 'Images',
  allowReordering = true,
  className = ''
}: ImageUploaderProps) => {
  const { token } = useAuth();
  const toast = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isBrowserOpen, setIsBrowserOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    // Check if adding these files would exceed the max limit
    if (images.length + files.length > maxImages) {
      toast({ message: `You can upload a maximum of ${maxImages} images`, type: 'error' });
      return;
    }

    const uploadFormData = new FormData();
    for (let i = 0; i < files.length; i++) {
      uploadFormData.append('images', files[i]);
    }
    
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      const endpoint = `/uploads/${folder}`;
      
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}${endpoint}`,
        uploadFormData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: ev => {
            const progress = ev.total ? Math.round((ev.loaded * 100) / ev.total) : 0;
            setUploadProgress(progress);
          },
        }
      );

      if (res.data && res.data.images) {
        const newImages = [...images];
        res.data.images.forEach((img: any) => {
          newImages.push(img.url);
        });
        onChange(newImages);
        toast({ message: `${res.data.images.length} image(s) uploaded successfully`, type: 'success' });
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      toast({ message: 'Failed to upload images', type: 'error' });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    onChange(newImages);
  };

  const handleMoveImage = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === images.length - 1)
    ) {
      return; // Can't move further
    }

    const newImages = [...images];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const temp = newImages[index];
    newImages[index] = newImages[targetIndex];
    newImages[targetIndex] = temp;
    onChange(newImages);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">{title}</label>
        <span className="text-xs text-gray-500">
          {images.length} / {maxImages} images
        </span>
      </div>

      {/* Image Gallery */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {images.map((image, index) => (
          <div key={index} className="relative group">
            <div className="relative h-32 bg-gray-100 rounded-md overflow-hidden border border-gray-200">
              <img 
                src={image} 
                alt={`Image ${index + 1}`} 
                className="w-full h-full object-cover" 
              />
              
              {/* Remove Button */}
              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4" />
              </button>
              
              {/* Move Buttons (if reordering is allowed) */}
              {allowReordering && (
                <div className="absolute bottom-2 right-2 flex flex-col space-y-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => handleMoveImage(index, 'up')}
                      className="bg-gray-800 text-white p-1 rounded-full"
                    >
                      <ArrowUp className="h-3 w-3" />
                    </button>
                  )}
                  {index < images.length - 1 && (
                    <button
                      type="button"
                      onClick={() => handleMoveImage(index, 'down')}
                      className="bg-gray-800 text-white p-1 rounded-full"
                    >
                      <ArrowDown className="h-3 w-3" />
                    </button>
                  )}
                </div>
              )}
              
              {/* Image Number Indicator */}
              <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded-md">
                {index + 1}
              </div>
            </div>
          </div>
        ))}
        
        {/* Upload Button (shown if below max limit) */}
        {images.length < maxImages && (
          <button
            type="button"
            onClick={handleUploadClick}
            className="h-32 border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition-colors"
          >
            {isUploading ? (
              <div className="text-center">
                <Loader className="h-8 w-8 text-gray-400 mx-auto animate-spin" />
                <p className="mt-2 text-xs text-gray-500">{uploadProgress}% Uploading...</p>
              </div>
            ) : (
              <>
                <ImageIcon className="h-8 w-8 text-gray-400 mb-2" />
                <p className="text-xs text-gray-500">Add Image</p>
              </>
            )}
          </button>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        multiple={true}
        className="hidden"
      />

      {/* Upload Button (below gallery) */}
      {images.length < maxImages && (
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={handleUploadClick}
            disabled={isUploading}
            className="flex items-center text-[#ff914d] hover:text-[#e8823d] transition-colors text-sm disabled:opacity-50"
          >
            <Upload className="h-4 w-4 mr-1" />
            {isUploading ? 'Uploading...' : 'Upload New'}
          </button>
          
          <button
            type="button"
            onClick={() => setIsBrowserOpen(true)}
            className="flex items-center text-blue-600 hover:text-blue-700 transition-colors text-sm"
          >
            <ImageIcon className="h-4 w-4 mr-1" />
            Select from Gallery
          </button>
        </div>
      )}

      {/* Image Browser Modal */}
      {isBrowserOpen && (
        <ImageBrowser
          isOpen={isBrowserOpen}
          onClose={() => setIsBrowserOpen(false)}
          onSelect={(selectedImages) => {
            if (images.length + selectedImages.length > maxImages) {
              // If adding all would exceed max, only add as many as possible
              const canAdd = maxImages - images.length;
              if (canAdd <= 0) {
                toast({ message: `You can upload a maximum of ${maxImages} images`, type: 'error' });
                return;
              }
              const newImages = [...images];
              for (let i = 0; i < canAdd; i++) {
                if (!newImages.includes(selectedImages[i])) {
                  newImages.push(selectedImages[i]);
                }
              }
              onChange(newImages);
              toast({ message: `Added ${canAdd} images. Maximum limit reached.`, type: 'info' });
            } else {
              // Add all selected images that aren't already in the array
              const newImages = [...images];
              let addedCount = 0;
              selectedImages.forEach(img => {
                if (!newImages.includes(img)) {
                  newImages.push(img);
                  addedCount++;
                }
              });
              onChange(newImages);
              if (addedCount > 0) {
                toast({ message: `Added ${addedCount} images successfully`, type: 'success' });
              }
            }
          }}
          multiple={true}
          folder={folder}
          preSelectedImages={images}
        />
      )}
    </div>
  );
};