import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/toaster';
import { useAuth } from '../contexts/AuthContext';
import { ProductContentTab } from '../components/products/ProductContentTab';
import { SchedulePriceTab } from '../components/products/SchedulePriceTab';
import { BookingDetailsTab } from '../components/products/BookingDetailsTab';
import { SpecialOffersTab } from '../components/products/SpecialOffersTab';
import { AvailabilityTab } from '../components/products/AvailabilityTab';
import { Save, ArrowLeft, Eye } from 'lucide-react';
import type { ProductFormData } from '@/types.ts';


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
  const toast = useToast();
  const isEdit = Boolean(id);
  const today = new Date().toISOString().split('T')[0];

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
    images: [],
    highlights: [],
    inclusions: [],
    exclusions: [],
    tags: [],
    pickupLocations: [],
    guides: [],
    languages: [],
    destinationId: '',
    experienceCategoryId: '',
    cancellationPolicy: '',
    isActive: true,
    availabilityStartDate: today,
    availabilityEndDate: undefined,
    blockedDates: [],
    capacity: 0
  });

  useEffect(() => {
    if (isEdit && id) {
      fetchProduct();
    }
  }, [id, isEdit]);
  const tabValidations: Record<string, (formData: any) => string[]> = {
    content: (formData) => {
      const missing: string[] = [];
      if (!formData.title) missing.push('Title');
      if (!formData.productCode) missing.push('Product Code');
      if (!formData.description) missing.push('Description');
      if (!formData.type) missing.push('Type');
      if (!formData.location) missing.push('Location');
      if (!formData.category) missing.push('Category');
      if (!formData.duration) missing.push('Duration');
      if (!formData.capacity || formData.capacity < 1) missing.push('Max Capacity');
      // Optionally require at least one image
      if (!formData.images || formData.images.length === 0) missing.push('At least one Image');
      return missing;
    },
    schedule: (formData) => {
      const missing: string[] = [];
      if (!formData.packages || formData.packages.length === 0) missing.push('At least one Package');
      // Add more checks as needed
      return missing;
    },
    booking: (formData) => {
      const missing: string[] = [];
      if (!formData.cancellationPolicy) missing.push('Cancellation Policy');
      // Add more checks as needed
      return missing;
    },
    offers: () => [],
    availability: () => [],
  };

  const handleTabChange = (nextTab: string) => {
    // Only validate when moving forward
    const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
    const nextIndex = tabs.findIndex(tab => tab.id === nextTab);
    if (nextIndex > currentIndex) {
      const validate = tabValidations[activeTab];
      if (validate) {
        const missingFields = validate(formData);
        if (missingFields.length > 0) {
          toast({
            message: `Please fill out: ${missingFields.join(', ')}`,
            type: 'error'
          });
          return; // Block tab change
        }
      }
    }
    setActiveTab(nextTab);
  };

  // Transform slots data to slotConfigs format for the form
  const transformProductDataForForm = (product: any) => {
    if (product && product.packages) {
      const transformedPackages = product.packages.map((pkg: any) => {
        // Only transform if slots exist and slotConfigs doesn't
        if (pkg.slots && Array.isArray(pkg.slots) && !pkg.slotConfigs) {
          const slotConfigs = pkg.slots.map((slot: any) => {
            return {
              times: slot.Time || [], // Time array from slot
              days: slot.days || [],
              adultTiers: slot.adultTiers || [],
              childTiers: slot.childTiers || []
            };
          });
          
          return {
            ...pkg,
            slotConfigs: slotConfigs
          };
        }
        return pkg;
      });
      
      return {
        ...product,
        packages: transformedPackages
      };
    }
    return product;
  };

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
        // Transform the product data to include slotConfigs based on slots data
        const transformedProduct = transformProductDataForForm(product);
        
        const startDate = transformedProduct.availabilityStartDate?.split('T')[0] || '';
        const endDate   = transformedProduct.availabilityEndDate   ? transformedProduct.availabilityEndDate.split('T')[0] : undefined;

        const blockedDates = (product.blockedDates || []).map((b: any) => ({
          id:     b.id,
          date:   b.date.split('T')[0],
          reason: b.reason
        }));
        
        const formattedData = {
          ...transformedProduct,
          availabilityStartDate: startDate,
          availabilityEndDate:   endDate   || undefined,
          blockedDates
        };
        
        setFormData(formattedData);
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

    // Validate form data
    if (!formData.title || !formData.productCode || !formData.description || !formData.category || 
        !formData.location || !formData.duration) {
      toast({ message: "Please fill out all required fields in the Product Content tab", type: "error" });
      setActiveTab('content');
      setIsSaving(false);
      return;
    }

    if (!formData.packages || formData.packages.length === 0) {
      toast({ message: "You must add at least one package option", type: "error" });
      setActiveTab('schedule');
      setIsSaving(false);
      return;
    }

    if (!formData.cancellationPolicy) {
      toast({ message: "Cancellation policy is required in the Booking Details tab", type: "error" });
      setActiveTab('booking');
      setIsSaving(false);
      return;
    }
    console.log('Submitting form data:', formData);

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

      if (response.status === 400) {
        const errorData = await response.json();
        let errorMessage = "Validation Error";
        
        if (errorData.error && typeof errorData.error === 'string') {
          errorMessage = errorData.error;
        } else if (errorData.message && typeof errorData.message === 'string') {
          errorMessage = errorData.message;
        } else if (errorData.details) {
          errorMessage = "Validation errors: " + Object.keys(errorData.details).map(key => 
            `${key} - ${errorData.details[key]}`
          ).join(", ");
        }
        
        toast({ message: errorMessage, type: 'error' });
        return;
      } else if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || error.message || 'Server error');
      }
      toast({ message: isEdit ? 'Product updated' : 'Product created', type: 'success' });
            
      navigate('/products');
      
    } catch (error) {
      console.error('Error saving product:', error);
      toast({ 
        message: error instanceof Error ? error.message : 'Failed to save product', 
        type: 'error' 
      });
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
  <button
    className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
    onClick={() => navigate(`/products/${id}/preview`)}
    type="button"
  >
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
                onClick={() => handleTabChange(tab.id)}
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