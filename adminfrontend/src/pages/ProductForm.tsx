import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ProductContentTab } from '../components/products/ProductContentTab';
import { SchedulePriceTab } from '../components/products/SchedulePriceTab';
import { BookingDetailsTab } from '../components/products/BookingDetailsTab';
import { SpecialOffersTab } from '../components/products/SpecialOffersTab';

import { Save, ArrowLeft, Eye } from 'lucide-react';
import { AvailabilityTab } from '@/components/availability/AvailabilityTab';

interface ProductFormData {
  // Basic Details
  title: string;
  productCode: string;
  description: string;
  type: 'TOUR' | 'EXPERIENCE';
  category: string;
  location: string;
  duration: string;
  capacity: number;
  price: number;
  discountPrice?: number;
  
  // Content
  images: string[];
  highlights: string[];
  inclusions: string[];
  exclusions: string[];
  itinerary?: any;
  tags: string[];
  
  // Location & Meeting
  meetingPoint?: string;
  pickupLocations: string[];
  
  // Tour Details
  difficulty?: string;
  healthRestrictions?: string;
  accessibility?: string;
  guides: string[];
  languages: string[];
  
  // Policies
  cancellationPolicy: string;
  
  // Packages will be handled separately
  packages?: any[];
  availabilities?: any[];
}

const tabs = [
  { id: 'content', name: 'Product Content', component: ProductContentTab },
  { id: 'schedule', name: 'Schedule & Price', component: SchedulePriceTab },
  { id: 'booking', name: 'Booking Details', component: BookingDetailsTab },
  { id: 'offers', name: 'Special Offers', component: SpecialOffersTab },
  { id: 'availability', name: 'Availability', component: AvailabilityTab },
];

export const ProductForm = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();
  const isEdit = Boolean(id);

  const [activeTab, setActiveTab] = useState('content');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<ProductFormData>({
    title: '',
    productCode: '',
    description: '',
    type: 'TOUR',
    category: '',
    location: '',
    duration: '',
    capacity: 1,
    price: 0,
    images: [],
    highlights: [],
    inclusions: [],
    exclusions: [],
    tags: [],
    pickupLocations: [],
    guides: [],
    languages: [],
    cancellationPolicy: '',
    availabilities: [],
  });

  useEffect(() => {
    if (isEdit && id) {
      fetchProduct();
    }
  }, [id, isEdit]);

  const fetchProduct = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/products/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const product = await response.json();
        setFormData(product);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const url = isEdit 
        ? `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/products/${id}`
        : `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/products`;

      // Prepare the data for submission - remove availabilities as they will be handled separately
      const { availabilities, ...productData } = formData;
      
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.error || 'Failed to save product');
        return;
      }
      
      const savedProduct = await response.json();
      
      // If we have availabilities to save
      if (formData.availabilities && formData.availabilities.length > 0) {
        try {
          // Update the product ID for new products
          const productId = savedProduct.id;
          const availabilityUpdates = formData.availabilities.map((a: any) => ({
            ...a,
            productId
          }));
          
          // Use bulk update for availabilities
          const availResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/availability/bulk`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ updates: availabilityUpdates }),
          });
          
          if (!availResponse.ok) {
            console.error('Failed to save availability data');
          }
        } catch (availError) {
          console.error('Error saving availability:', availError);
        }
      }
      
      // Navigate after all operations are complete
      navigate('/products');
      
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Failed to save product');
    } finally {
      setIsSaving(false);
    }
  };

  const updateFormData = (updates: Partial<ProductFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const ActiveTabComponent = tabs.find(tab => tab.id === activeTab)?.component;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff914d]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/products')}
            className="mr-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEdit ? 'Edit Product' : 'Create New Product'}
            </h1>
            <p className="text-gray-600 mt-2">
              {isEdit ? 'Update product details and settings' : 'Add a new tour or experience to your platform'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {isEdit && (
            <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </button>
          )}
          <button
            onClick={handleSubmit}
            disabled={isSaving}
            className="flex items-center px-6 py-2 bg-[#ff914d] text-white rounded-lg hover:bg-[#e8823d] transition-colors disabled:opacity-50"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-[#ff914d] text-[#ff914d]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {ActiveTabComponent && (
            <ActiveTabComponent
              formData={formData}
              updateFormData={updateFormData}
              isEdit={isEdit}
            />
          )}
        </div>
      </div>
    </div>
  );
};