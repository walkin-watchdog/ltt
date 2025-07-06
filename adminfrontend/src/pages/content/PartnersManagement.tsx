import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ImageUploader } from '../../components/gallery/ImageUploader';
import { useToast } from '../../components/ui/toaster';

export const PartnersManagement = () => {
  const { token } = useAuth();
  const toast = useToast();
  const [images, setImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch existing partner logos
  const fetchImages = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/uploads/partners`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch partners');
      const data = await res.json();
      // data.images is [{ id, url, bytes, ... }]
      setImages(data.images.map((img: any) => img.url));
    } catch (err) {
      console.error(err);
      toast({ message: 'Failed to load partner images', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Partners</h2>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff914d]"></div>
        </div>
      ) : (
        <ImageUploader
          images={images}
          onChange={(newImages) => setImages(newImages)}
          maxImages={20}
          folder="partners"
          title="Partner Logos"
        />
      )}
    </div>
  );
};