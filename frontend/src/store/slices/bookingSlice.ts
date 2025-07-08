import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

interface BookingData {
  productId: string;
  packageId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  adults: number;
  children: number;
  bookingDate: string;
  notes?: string;
}

interface BookingState {
  currentBooking: any;
  isLoading: boolean;
  error: string | null;
  step: number;
}

const initialState: BookingState = {
  currentBooking: null,
  isLoading: false,
  error: null,
  step: 1,
};

export const createBooking = createAsyncThunk(
  'booking/createBooking',
  async (bookingData: BookingData) => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error);
    }

    return await response.json();
  }
);

export const rnpaylater = createAsyncThunk(
  'booking/paylater',
  async (bookingData: BookingData) => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/bookings/pay-later`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error);
    }

    return await response.json();
  }
);

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    setStep: (state, action) => {
      state.step = action.payload;
    },
    resetBooking: (state) => {
      state.currentBooking = null;
      state.step = 1;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createBooking.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentBooking = action.payload;
        state.step = 2; // Move to payment step
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to create booking';
      })
      .addCase(rnpaylater.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(rnpaylater.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentBooking = action.payload;
      })
      .addCase(rnpaylater.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to create booking';
      });
  },
});

export const { setStep, resetBooking, clearError } = bookingSlice.actions;
export default bookingSlice.reducer;