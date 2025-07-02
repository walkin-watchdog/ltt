import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';

interface ItineraryDay {
  day: number;
  title: string;
  description: string;
  activities: string[];
  images: string[];
}

interface Product {
  pickupLocationDetails(pickupLocationDetails: any): unknown;
  pickupOption: boolean;
  allowTravelersPickupPoint: any;
  meetingPoints(meetingPoints: any): unknown;
  pickupStartTime: any;
  doesTourEndAtMeetingPoint: undefined;
  endPoints(endPoints: any): unknown;
  guides: boolean;
  wheelchairAccessible: any;
  strollerAccessible: any;
  serviceAnimalsAllowed: any;
  publicTransportAccess: any;
  infantSeatsRequired: any;
  infantSeatsAvailable: any;
  accessibilityFeatures: boolean;
  difficulty: any;
  pickupLocations: boolean;
  meetingPoint: any;
  cancellationPolicy: string;
  id: string;
  title: string;
  productCode: string;
  slug: string;
  description: string;
  type: 'TOUR' | 'EXPERIENCE';
  category: string;
  location: string;
  duration: string;
  capacity: number;
  highlights: string[];
  inclusions: string[];
  exclusions: string[];
  itineraries?: ItineraryDay[];
  images: string[];
  tags: string[];
  packages?: any[];
  reviews?: any[];
  availabilities?: any[];
  availabilityStatus: 'AVAILABLE' | 'SOLD_OUT' | 'NOT_OPERATING';
  nextAvailableDate?: string;
  availableDates?: string[];
  lowestPackagePrice?: number;
  lowestDiscountedPackagePrice?: number;
  healthRestrictions?: string[]; // Changed to array of strings
}

interface ProductsFilter {
  type?: string;
  category?: string;
  location?: string;
  availability?: 'AVAILABLE' | 'SOLD_OUT' | 'NOT_OPERATING';
  limit?: string;
}

interface ProductsState {
  products: Product[];
  currentProduct: Product | null;
  isLoading: boolean;
  error: string | null;
  filters: ProductsFilter;
}

const initialState: ProductsState = {
  products: [],
  currentProduct: null,
  isLoading: false,
  error: null,
  filters: {},
};

const getErrorMessage = async (response: Response) => {
  try {
    const text = await response.text();
    return `(${response.status}) ${text || response.statusText}`;
  } catch {
    return `(${response.status}) ${response.statusText}`;
  }
};

export const fetchProducts = createAsyncThunk<
   Product[],
   Partial<ProductsFilter>
 >(
   'products/fetchProducts',
   async (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) params.append(key, String(value));
    });

    const response = await fetch(`${import.meta.env.VITE_API_URL}/products?${params}`);
    
    if (!response.ok) {
      throw new Error(await getErrorMessage(response));
    }

    return await response.json();
  }
);

export const fetchProduct = createAsyncThunk<
   Product,
   string
 >(
   'products/fetchProduct',
   async (id) => {
    console.log('Fetching product with ID:', id);
    const response = await fetch(`${import.meta.env.VITE_API_URL}/products/${id}`);
    console.log('Response status:', response);
    if (!response.ok) {
      throw new Error(await getErrorMessage(response));
    }

    return await response.json();
  }
);

export const fetchProductBySlug = createAsyncThunk<
  Product,
  string
>(
  'products/fetchProductBySlug',
  async (slug) => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/products/by-slug/${slug}`);
    if (!response.ok) {
      throw new Error(await getErrorMessage(response));
    }
    return await response.json();
  }
);


const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setFilters: (
     state,
     action: PayloadAction<Partial<ProductsFilter>>
    ) => {
     state.filters = { ...state.filters, ...action.payload };
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch products';
      })
      .addCase(fetchProduct.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentProduct = action.payload;
      })
      .addCase(fetchProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch product';
      })
      .addCase(fetchProductBySlug.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProductBySlug.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentProduct = action.payload;
      })
      .addCase(fetchProductBySlug.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch product';
      });
  },
});

export const { setFilters, clearError } = productsSlice.actions;
export default productsSlice.reducer;