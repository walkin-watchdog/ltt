import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ProductContentTab } from '../components/products/ProductContentTab';
import { SchedulePriceTab } from '../components/products/SchedulePriceTab';
import { BookingDetailsTab } from '../components/products/BookingDetailsTab';
import { SpecialOffersTab } from '../components/products/SpecialOffersTab';

import { Save, ArrowLeft, Eye } from 'lucide-react';
import type { ProductFormData } from '@/types.ts';


const tabs = [
  { id: 'content', name: 'Product Content', component: ProductContentTab },
  { id: 'schedule', name: 'Schedule & Price', component: SchedulePriceTab },
  { id: 'booking', name: 'Booking Details', component: BookingDetailsTab },
  { id: 'offers', name: 'Special Offers', component: SpecialOffersTab },
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
    isActive: true,
    availabilityStartDate: '',
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

      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.error || 'Failed to save product');
        return;
      }
            
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
          {/* Status Toggle */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Status:</span>
            <button
              onClick={() => updateFormData({ isActive: !formData.isActive })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                formData.isActive ? 'bg-[#ff914d]' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  formData.isActive ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm font-medium ${formData.isActive ? 'text-green-600' : 'text-gray-500'}`}>
              {formData.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
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