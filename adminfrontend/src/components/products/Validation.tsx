import type { Toast } from "@/types.ts";

export const validateTab = (tabId: string, formData: any) => {
  switch (tabId) {
    case 'basic':
      return formData.title && formData.productCode && formData.description &&
        formData.type && formData.location && formData.duration && formData.capacity;
    case 'images':
      return formData.images && formData.images.length > 0;
    case 'itinerary':
      return formData.type !== 'TOUR' || (formData.itinerary && formData.itinerary.length > 0);
    case 'pickup':
      return formData.pickupOption;
    case 'content':
      return (
        (formData.highlights && formData.highlights.length > 0) ||
        (formData.inclusions && formData.inclusions.length > 0) ||
        (formData.exclusions && formData.exclusions.length > 0) ||
        (formData.tags && formData.tags.length > 0)
      );
    case 'details':
      return (
        !!formData.difficulty ||
        (formData.accessibilityFeatures && formData.accessibilityFeatures.length > 0) ||
        !!formData.wheelchairAccessible ||
        !!formData.strollerAccessible ||
        !!formData.serviceAnimalsAllowed ||
        !!formData.publicTransportAccess ||
        !!formData.infantSeatsRequired ||
        !!formData.infantSeatsAvailable ||
        (formData.healthRestrictions && formData.healthRestrictions.length > 0)
      );
    case 'guides':
      return formData.guides && formData.guides.length > 0;
    default:
      return true;
  }
};

export const validateTabWithToast = (tabId: string, formData: any, toast: (t: Omit<Toast, 'id'>) => void): boolean => {
  switch (tabId) {
    case 'basic':
      const missingBasicFields = [];
      if (!formData.title) missingBasicFields.push('Title');
      if (!formData.productCode) missingBasicFields.push('Product Code');
      if (!formData.description) missingBasicFields.push('Description');
      if (!formData.type) missingBasicFields.push('Product Type');
      if (!formData.location) missingBasicFields.push('Location');
      if (!formData.duration) missingBasicFields.push('Duration');
      if (!formData.capacity) missingBasicFields.push('Max Capacity');
      if (formData.type === 'EXPERIENCE' && !formData.category) missingBasicFields.push('Category');
      if (missingBasicFields.length > 0) {
        toast({
          message: `Please fill the following required fields: ${missingBasicFields.join(', ')}`,
          type: 'error'
        });
        return false;
      }
      return true;
    case 'images':
      if (!formData.images || formData.images.length === 0) {
        toast({
          message: 'Please upload at least one product image',
          type: 'error'
        });
        return false;
      }
      return true;
    case 'itinerary':
      if (formData.type === 'TOUR' && (!formData.itinerary || formData.itinerary.length === 0)) {
        toast({
          message: 'Please add at least one day to the itinerary for tours',
          type: 'error'
        });
        return false;
      }
      return true;
    case 'pickup':
      if (!formData.pickupOption) {
        toast({
          message: 'Please select a pickup option',
          type: 'error'
        });
        return false;
      }
      if ((formData.pickupOption === 'We can pick up travelers or meet them at a meeting point' ||
        formData.pickupOption === 'No, we meet all travelers at a meeting point') &&
        !formData.meetingPoint && (!formData.meetingPoints || formData.meetingPoints.length === 0)) {
        toast({
          message: 'Please provide at least one meeting point',
          type: 'error'
        });
        return false;
      }
      return true;
    case 'content':
    case 'details':
    case 'guides':
      return true;
    default:
      return true;
  }
};