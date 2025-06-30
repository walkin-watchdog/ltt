import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  X, 
  Save,
  Image,
  Plus
} from 'lucide-react';
import axios from 'axios';
import { useToast } from '@/components/ui/toaster';

interface Destination {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  image: string;
  bannerImage: string;
  highlights: string[];
}

interface DestinationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (destination: Destination) => void;
}

export const DestinationModal = ({ isOpen, onClose, onSelect }: DestinationModalProps) => {
  const { token } = useAuth();
  const toast = useToast();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newHighlight, setNewHighlight] = useState('');
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  
  const [newDestination, setNewDestination] = useState<Partial<Destination>>({
    name: '',
    tagline: '',
    description: '',
    image: '',
    bannerImage: '',
    highlights: []
  });

  useEffect(() => {
    if (isOpen) {
      fetchDestinations();
    }
  }, [isOpen, token]);

  const fetchDestinations = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/destinations`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setDestinations(data);
      }
    } catch (error) {
      console.error('Error fetching destinations:', error);
      toast({ message: 'Failed to load destinations', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateDestination = async () => {
    if (!newDestination.name || !newDestination.tagline || 
        !newDestination.description || !newDestination.image ||
        !newDestination.bannerImage) {
      toast({ message: 'Please fill in all required fields', type: 'error' });
      return;
    }
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/destinations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newDestination)
      });
      
      if (response.ok) {
        const createdDestination = await response.json();
        toast({ message: 'Destination created successfully', type: 'success' });
        
        // Add to the list and select it
        setDestinations([...destinations, createdDestination]);
        onSelect(createdDestination);
        
        // Reset form and close it
        setNewDestination({
          name: '',
          tagline: '',
          description: '',
          image: '',
          bannerImage: '',
          highlights: []
        });
        setShowCreateForm(false);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create destination');
      }
    } catch (error) {
      console.error('Error creating destination:', error);
      toast({ message: error instanceof Error ? error.message : 'An error occurred', type: 'error' });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'image' | 'bannerImage') => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('images', files[0]);

      const res = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/uploads/products`,
        uploadFormData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: ev => {
            const pct = Math.round((ev.loaded * 100) / (ev.total || 1));
            setUploadProgress(pct);
          },
        }
      );

      const { images } = res.data as { images: Array<{ url: string }> };
      if (images && images.length > 0) {
        setNewDestination(prev => ({
          ...prev,
          [field]: images[0].url
        }));
        toast({ message: 'Image uploaded successfully', type: 'success' });
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({ message: 'Failed to upload image', type: 'error' });
    } finally {
      setUploadProgress(null);
    }
  };

  const handleAddHighlight = () => {
    if (newHighlight.trim()) {
      setNewDestination(prev => ({
        ...prev,
        highlights: [...(prev.highlights || []), newHighlight.trim()]
      }));
      setNewHighlight('');
    }
  };

  const handleRemoveHighlight = (index: number) => {
    setNewDestination(prev => ({
      ...prev,
      highlights: prev.highlights?.filter((_, i) => i !== index)
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b border-gray-200 px-6 py-4">
          <h2 className="text-xl font-bold text-gray-900">
            {showCreateForm ? 'Create New Destination' : 'Select Destination'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-6">
          {!showCreateForm ? (
            <>
              {/* List of existing destinations */}
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff914d]"></div>
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <button
                      onClick={() => setShowCreateForm(true)}
                      className="flex items-center text-[#ff914d] hover:text-[#e8823d]"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Create New Destination
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                    {destinations.map((destination) => (
                      <div 
                        key={destination.id}
                        onClick={() => onSelect(destination)}
                        className="border rounded-lg p-3 cursor-pointer hover:border-[#ff914d] transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="h-12 w-12 rounded bg-gray-100 flex-shrink-0 overflow-hidden">
                            {destination.image && (
                              <img
                                src={destination.image}
                                alt={destination.name}
                                className="h-full w-full object-cover"
                              />
                            )}
                          </div>
                          <div className='flex-1 min-w-0'>
                            <h3 className="font-medium text-gray-900 ">{destination.name}</h3>
                            <p className="text-sm text-gray-500">{destination.tagline}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {destinations.length === 0 && (
                      <div className="col-span-2 text-center py-8 text-gray-500">
                        No destinations found. Create your first destination.
                      </div>
                    )}
                  </div>
                </>
              )}
            </>
          ) : (
            /* Create new destination form */
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Destination Name *
                </label>
                <input
                  type="text"
                  value={newDestination.name}
                  onChange={(e) => setNewDestination(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
                  placeholder="e.g., Delhi"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tagline *
                </label>
                <input
                  type="text"
                  value={newDestination.tagline}
                  onChange={(e) => setNewDestination(prev => ({ ...prev, tagline: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
                  placeholder="Short description for destination card"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Description *
                </label>
                <textarea
                  rows={4}
                  value={newDestination.description}
                  onChange={(e) => setNewDestination(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
                  placeholder="Detailed description of the destination"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Card Image *
                  </label>
                  <div className="mt-1 flex items-center">
                    {newDestination.image ? (
                      <div className="relative">
                        <img
                          src={newDestination.image}
                          alt="Destination"
                          className="h-32 w-full object-cover rounded-md"
                        />
                        <button
                          type="button"
                          onClick={() => setNewDestination(prev => ({ ...prev, image: '' }))}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center hover:border-gray-400 transition-colors w-full">
                        <input
                          type="file"
                          id="card-image"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, 'image')}
                          className="hidden"
                        />
                        <label htmlFor="card-image" className="cursor-pointer">
                          <Image className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600">Upload image</p>
                        </label>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">This image appears on the destination card</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Banner Image *
                  </label>
                  <div className="mt-1 flex items-center">
                    {newDestination.bannerImage ? (
                      <div className="relative">
                        <img
                          src={newDestination.bannerImage}
                          alt="Banner"
                          className="h-32 w-full object-cover rounded-md"
                        />
                        <button
                          type="button"
                          onClick={() => setNewDestination(prev => ({ ...prev, bannerImage: '' }))}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center hover:border-gray-400 transition-colors w-full">
                        <input
                          type="file"
                          id="banner-image"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, 'bannerImage')}
                          className="hidden"
                        />
                        <label htmlFor="banner-image" className="cursor-pointer">
                          <Image className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600">Upload banner</p>
                        </label>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">This image appears as hero on destination page</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Highlights
                </label>
                <div className="space-y-2">
                  <div className="flex">
                    <input
                      type="text"
                      value={newHighlight}
                      onChange={(e) => setNewHighlight(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
                      placeholder="Add a highlight"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddHighlight();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAddHighlight}
                      className="px-4 py-2 bg-[#ff914d] text-white rounded-r-md hover:bg-[#e8823d] transition-colors"
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>
                  
                  {newDestination.highlights && newDestination.highlights.length > 0 ? (
                    <div className="border border-gray-200 rounded-md p-3">
                      <ul className="space-y-2">
                        {newDestination.highlights.map((highlight, index) => (
                          <li key={index} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                            <span className="text-sm">{highlight}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveHighlight(index)}
                              className="text-red-500 hover:text-red-700 transition-colors"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No highlights added yet</p>
                  )}
                </div>
              </div>
              
              <div className="flex space-x-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateDestination}
                  className="px-4 py-2 bg-[#ff914d] text-white rounded-md hover:bg-[#e8823d] transition-colors flex items-center"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Create Destination
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};