import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

interface Product {
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
  price: number;
  discountPrice?: number;
  highlights: string[];
  inclusions: string[];
  exclusions: string[];
  itinerary?: any;
  images: string[];
  tags: string[];
  packages?: any[];
  reviews?: any[];
  availabilities?: any[];
  // Add availability status fields
  availabilityStatus?: 'AVAILABLE' | 'SOLD_OUT' | 'NOT_OPERATING';
  nextAvailableDate?: string;
  availableDates?: string[];
}

interface ProductsState {
  products: Product[];
  currentProduct: Product | null;
  isLoading: boolean;
  error: string | null;
  filters: {
    type?: string;
    category?: string;
    location?: string;
    // Add availability filter
    availability?: string;
  };
}

const initialState: ProductsState = {
  products: [],
  currentProduct: null,
  isLoading: false,
  error: null,
  filters: {},
};

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (filters: { type?: string; category?: string; location?: string, limit?: string } = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });

    const response = await fetch(`${import.meta.env.VITE_API_URL}/products?${params}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }

    return await response.json();
  }
);

export const fetchProduct = createAsyncThunk(
  'products/fetchProduct',
  async (id: string) => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/products/${id}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch product');
    }

    return await response.json();
  }
);

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = action.payload;
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
      });
  },
});

export const { setFilters, clearError } = productsSlice.actions;
export default productsSlice.reducer;