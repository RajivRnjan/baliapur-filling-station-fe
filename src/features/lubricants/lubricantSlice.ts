import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import api from '../../utils/api';

export interface Lubricant {
  id: number;
  name: string;
  qty_name: string;
  price: string | number;
  stock: number;
  created_at?: string;
  updated_at?: string;
}

export interface LubricantSalesHistory {
  id: number;
  daily_sale_id: number;
  lubricant_id: number;
  quantity: number;
  price: string | number;
  amount: string | number;
  daily_sale?: {
    id: number;
    date: string;
  };
  lubricant?: {
    id: number;
    name: string;
    qty_name: string;
  };
}

interface LubricantState {
  items: Lubricant[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  pagination: {
    current_page: number;
    total: number;
    per_page: number;
    last_page: number;
  };
  salesHistory: {
    items: LubricantSalesHistory[];
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
    pagination: {
      current_page: number;
      total: number;
      per_page: number;
      last_page: number;
    };
  };
}

const initialState: LubricantState = {
  items: [],
  status: 'idle',
  error: null,
  pagination: {
    current_page: 1,
    total: 0,
    per_page: 10,
    last_page: 1,
  },
  salesHistory: {
    items: [],
    status: 'idle',
    error: null,
    pagination: {
      current_page: 1,
      total: 0,
      per_page: 10,
      last_page: 1,
    },
  },
};

export const fetchLubricants = createAsyncThunk(
  'lubricants/fetchLubricants',
  async (
    params: { search?: string; stock_status?: string; per_page?: number; page?: number } | undefined,
    { rejectWithValue }
  ) => {
    try {
      const response = await api.get('/lubricants', { params });
      return response.data.lubricants;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch lubricants');
    }
  }
);

export const addLubricant = createAsyncThunk(
  'lubricants/addLubricant',
  async (newLubricant: Omit<Lubricant, 'id'>, { rejectWithValue }) => {
    try {
      const response = await api.post('/lubricants', newLubricant);
      return response.data.lubricant || response.data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to add lubricant');
    }
  }
);

export const updateLubricant = createAsyncThunk(
  'lubricants/updateLubricant',
  async ({ id, ...updatedData }: Partial<Lubricant> & { id: number }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/lubricants/${id}`, updatedData);
      return response.data.lubricant || response.data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to update lubricant');
    }
  }
);

export const deleteLubricant = createAsyncThunk(
  'lubricants/deleteLubricant',
  async (id: number, { rejectWithValue }) => {
    try {
      await api.delete(`/lubricants/${id}`);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to delete lubricant');
    }
  }
);

export const addLubricantStock = createAsyncThunk(
  'lubricants/addLubricantStock',
  async ({ id, quantity }: { id: number; quantity: number }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/lubricants/${id}/add-stock`, { quantity });
      return response.data.lubricant;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to add stock');
    }
  }
);

export const fetchLubricantSalesHistory = createAsyncThunk(
  'lubricants/fetchLubricantSalesHistory',
  async (params: { page?: number; per_page?: number } | undefined, { rejectWithValue }) => {
    try {
      const response = await api.get('/lubricants-sales-history', { params });
      return response.data.history;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch sales history');
    }
  }
);

const lubricantSlice = createSlice({
  name: 'lubricants',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLubricants.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchLubricants.fulfilled, (state, action) => {
        state.status = 'succeeded';
        if (action.payload && action.payload.data) {
          state.items = action.payload.data;
          state.pagination = {
            current_page: action.payload.current_page || 1,
            total: action.payload.total || 0,
            per_page: action.payload.per_page || 10,
            last_page: action.payload.last_page || Math.ceil((action.payload.total || 0) / (action.payload.per_page || 10)),
          };
        } else {
          state.items = Array.isArray(action.payload) ? action.payload : [];
          state.pagination = {
            current_page: 1,
            total: state.items.length,
            per_page: 10,
            last_page: 1,
          };
        }
      })
      .addCase(fetchLubricants.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(addLubricant.fulfilled, (state, action: PayloadAction<Lubricant>) => {
        state.items.push(action.payload);
      })
      .addCase(updateLubricant.fulfilled, (state, action: PayloadAction<Lubricant>) => {
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(deleteLubricant.fulfilled, (state, action: PayloadAction<number>) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
      })
      .addCase(addLubricantStock.fulfilled, (state, action: PayloadAction<Lubricant>) => {
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(fetchLubricantSalesHistory.pending, (state) => {
        state.salesHistory.status = 'loading';
      })
      .addCase(fetchLubricantSalesHistory.fulfilled, (state, action) => {
        state.salesHistory.status = 'succeeded';
        if (action.payload && action.payload.data) {
          state.salesHistory.items = action.payload.data;
          state.salesHistory.pagination = {
            current_page: action.payload.current_page || 1,
            total: action.payload.total || 0,
            per_page: action.payload.per_page || 10,
            last_page: action.payload.last_page || Math.ceil((action.payload.total || 0) / (action.payload.per_page || 10)),
          };
        }
      })
      .addCase(fetchLubricantSalesHistory.rejected, (state, action) => {
        state.salesHistory.status = 'failed';
        state.salesHistory.error = action.payload as string;
      });
  },
});

export default lubricantSlice.reducer;
