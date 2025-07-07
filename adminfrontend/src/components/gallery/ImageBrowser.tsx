import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Search, X, FolderOpen, Loader, Check, Trash } from 'lucide-react';
import { useToast } from '../ui/toaster';
import { formatBytes } from '../../lib/utils';
import type { ImageBrowserProps } from '@/types.ts';



export const ImageBrowser = ({ 
  isOpen, 
  onClose, 
  onSelect, 
  multiple = false, 
  folder = '',
  preSelectedImages = []
}: ImageBrowserProps) => {
  const { token } = useAuth();
  const toast = useToast();
  const [images, setImages] = useState<any[]>([]);
  const toastRef = useRef(toast);
  useEffect(() => { toastRef.current = toast }, [toast]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImages, setSelectedImages] = useState<string[]>(preSelectedImages);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFolder, setActiveFolder] = useState(folder);
  const [folders, setFolders] = useState<string[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchFolders = useCallback(async () => {
    try {
      // Predefined folders for organization
      const defaultFolders = ['products', 'itineraries', 'destinations', 'experiences', 'gallery'];
      setFolders(defaultFolders);
    } catch (error) {
      console.error('Error fetching folders:', error);
      toastRef.current({ message: 'Failed to load folders', type: 'error' });
    }
  }, []);

  const fetchImages = useCallback(async (cursor = '', loadMore = false) => {
    if (loadMore) setLoadingMore(true);
    else setIsLoading(true);
    
    try {
      let url = `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/uploads`;
      
      if (activeFolder) {
        url += `/${activeFolder}`;
      }
      
      const params = new URLSearchParams();
      if (cursor) params.append('next_cursor', cursor);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setImages(prev => loadMore ? [...prev, ...data.images] : data.images);
        setNextCursor(data.nextCursor);
        setHasMore(data.hasMore);
      } else {
        throw new Error('Failed to fetch images');
      }
    } catch (error) {
      console.error('Error fetching images:', error);
      toastRef.current({ message: 'Failed to load images', type: 'error' });
    } finally {
      if (loadMore) setLoadingMore(false);
      else setIsLoading(false);
    }
  }, [activeFolder, token]);

  const searchImages = useCallback(async () => {
    if (!searchTerm.trim()) {
      fetchImages();
      return;
    }
    
    setIsLoading(true);
    try {
      const query = searchTerm.trim();
      const url = `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/uploads/search?q=${encodeURIComponent(query)}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setImages(data.images);
        setNextCursor(data.nextCursor);
        setHasMore(data.hasMore);
      } else {
        throw new Error('Failed to search images');
      }
    } catch (error) {
      console.error('Error searching images:', error);
      toastRef.current({ message: 'Failed to search images', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, token, fetchImages]);

  useEffect(() => {
    if (isOpen) {
      fetchFolders();
      setSelectedImages(preSelectedImages);
    }
  }, [isOpen, fetchFolders, preSelectedImages]);

  useEffect(() => {
    if (!isOpen) return;
    fetchImages();
  }, [isOpen, activeFolder]);

  const debouncedSearch = useCallback(() => {
    const handler = setTimeout(() => {
      searchImages();
    }, 500);
    
    return () => {
      clearTimeout(handler);
    };
  }, [searchImages]);

  useEffect(() => {
    const cleanup = debouncedSearch();
    return cleanup;
  }, [searchTerm, debouncedSearch]);

  const handleFolderChange = (folder: string) => {
    setActiveFolder(folder);
    setNextCursor(null);
    setSearchTerm('');
  };

  const handleImageClick = (imageUrl: string) => {
    if (multiple) {
      setSelectedImages(prev => 
        prev.includes(imageUrl) 
          ? prev.filter(url => url !== imageUrl) 
          : [...prev, imageUrl]
      );
    } else {
      setSelectedImages([imageUrl]);
    }
  };

  const handleConfirm = () => {
    onSelect(selectedImages);
    onClose();
  };

  const handleDeleteImage = async (publicId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!window.confirm('Are you sure you want to delete this image? This action cannot be undone.')) {
      return;
    }
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/uploads/${publicId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        setImages(prev => prev.filter(img => img.id !== publicId));
        setSelectedImages(prev => prev.filter(url => !url.includes(publicId)));
        toast({ message: 'Image deleted successfully', type: 'success' });
      } else {
        throw new Error('Failed to delete image');
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      toast({ message: 'Failed to delete image', type: 'error' });
    }
  };

  const handleLoadMore = () => {
    if (nextCursor) {
      fetchImages(nextCursor, true);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center border-b border-gray-200 px-6 py-4">
          <h2 className="text-xl font-bold text-gray-900">
            {multiple ? 'Select Images' : 'Select an Image'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="flex h-[calc(90vh-8rem)]">
          {/* Folders Sidebar */}
          <div className="w-48 border-r border-gray-200 p-4 overflow-y-auto">
            <h3 className="font-semibold text-gray-700 mb-2">Folders</h3>
            <ul className="space-y-1">
              <li>
                <button
                  type="button"
                  onClick={() => handleFolderChange('')}
                  className={`w-full text-left px-3 py-2 rounded ${
                    activeFolder === '' 
                      ? 'bg-[#ff914d] text-white' 
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  All Images
                </button>
              </li>
              {folders.map((f) => (
                <li key={f}>
                  <button
                    type="button"
                    onClick={() => handleFolderChange(f)}
                    className={`w-full text-left px-3 py-2 rounded flex items-center ${
                      activeFolder === f 
                        ? 'bg-[#ff914d] text-white' 
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <FolderOpen className="h-4 w-4 mr-2" />
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Main Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {/* Search */}
            <div className="mb-4 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search images..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
              />
            </div>
            
            {/* Selected Count */}
            {multiple && selectedImages.length > 0 && (
              <div className="mb-4 px-3 py-2 bg-blue-50 border border-blue-200 rounded-md flex items-center justify-between">
                <span className="text-blue-700">
                {selectedImages.length} image{selectedImages.length !== 1 ? 's' : ''} selected
                </span>
                <button 
                  type="button"
                  onClick={() => setSelectedImages([])} 
                  className="text-blue-600 hover:text-blue-800 text-sm underline"
                >
                  Clear selection
                </button>
              </div>
            )}
            
            {/* Image Grid */}
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader className="h-8 w-8 text-[#ff914d] animate-spin" />
              </div>
            ) : images.length === 0 ? (
              <div className="text-center py-12">
                <FolderOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No images found</h3>
                <p className="text-gray-500">
                  {searchTerm 
                    ? 'Try a different search term or clear your search' 
                    : 'Upload some images to get started'}
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {images.map((image) => (
                    <div
                      key={image.id}
                      onClick={() => handleImageClick(image.url)}
                      className={`group relative rounded-lg overflow-hidden border-2 ${
                        selectedImages.includes(image.url)
                          ? 'border-[#ff914d] shadow-md'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="relative aspect-square bg-gray-100">
                        <img 
                          src={image.url} 
                          alt="Gallery image" 
                          className="w-full h-full object-cover" 
                          loading="lazy"
                        />
                        
                        {selectedImages.includes(image.url) && (
                          <div className="absolute inset-0 bg-[#ff914d] bg-opacity-20 flex items-center justify-center">
                            <div className="bg-[#ff914d] text-white p-2 rounded-full">
                              <Check className="h-5 w-5" />
                            </div>
                          </div>
                        )}
                        
                        <button
                          type="button"
                          onClick={(e) => handleDeleteImage(image.id, e)}
                          className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      </div>
                      
                      <div className="p-2 text-xs text-gray-500">
                        <div className="truncate">{image.id.split('/').pop() || image.id}</div>
                        <div>{formatBytes(image.bytes)}</div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {hasMore && (
                  <div className="mt-6 text-center">
                    <button
                      type="button"
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                      className="px-4 py-2 bg-gray-100 rounded-md text-gray-700 hover:bg-gray-200 transition-colors"
                    >
                      {loadingMore ? (
                        <span className="flex items-center">
                          <Loader className="h-4 w-4 animate-spin mr-2" />
                          Loading...
                        </span>
                      ) : (
                        'Load More'
                      )}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        
        {/* Footer with Actions */}
        <div className="border-t border-gray-200 px-6 py-4 flex justify-end items-center space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={selectedImages.length === 0}
            className="px-4 py-2 bg-[#ff914d] text-white rounded-md hover:bg-[#e8823d] transition-colors disabled:opacity-50"
          >
            {multiple ? 'Select Images' : 'Select Image'}
          </button>
        </div>
      </div>
    </div>
  );
};