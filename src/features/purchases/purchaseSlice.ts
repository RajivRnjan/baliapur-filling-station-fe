import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import api from '../../utils/api';

interface Purchase {
  id?: number;
  sl_no?: number;
  date: string;
  ms: number;
  hsd: number;
  xp: number;
  is_opening: number | boolean;
  remarks: string | null;
  created_at?: string;
  updated_at?: string;
}

interface PurchaseState {
  items: Purchase[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  totals: any;
  pagination: {
    current_page: number;
    total: number;
    per_page: number;
    last_page: number;
  };
}

const initialState: PurchaseState = {
  items: [],
  status: 'idle',
  error: null,
  totals: null,
  pagination: {
    current_page: 1,
    total: 0,
    per_page: 10,
    last_page: 1,
  },
};

export const fetchPurchases = createAsyncThunk(
  'purchases/fetchPurchases',
  async (
    params: { is_opening?: number | boolean | string; start_date?: string; end_date?: string; per_page?: number; page?: number } | undefined,
    { rejectWithValue }
  ) => {
    try {
      const response = await api.get('/purchases', { params });
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const addPurchase = createAsyncThunk(
  'purchases/addPurchase',
  async (newPurchase: any, { rejectWithValue }) => {
    try {
      const response = await api.post('/purchases', newPurchase);
      return response.data.purchase;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const updatePurchase = createAsyncThunk(
  'purchases/updatePurchase',
  async (data: { sl_no: number; date: string; ms: number; hsd: number; xp: number; is_opening?: number | boolean; remarks?: string | null }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/purchases/${data.sl_no}`, data);
      return response.data.purchase;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const deletePurchase = createAsyncThunk(
  'purchases/deletePurchase',
  async (id: number, { rejectWithValue }) => {
    try {
      await api.delete(`/purchases/${id}`);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

const purchaseSlice = createSlice({
  name: 'purchases',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPurchases.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchPurchases.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const purchasesData = action.payload.purchases || action.payload;
        state.totals = action.payload.totals || null;
        
        if (purchasesData && purchasesData.data) {
          state.items = purchasesData.data;
          state.pagination = {
            current_page: purchasesData.current_page || 1,
            total: purchasesData.total || 0,
            per_page: purchasesData.per_page || 10,
            last_page: purchasesData.last_page || Math.ceil((purchasesData.total || 0) / (purchasesData.per_page || 10)),
          };
        } else {
          state.items = Array.isArray(purchasesData) ? purchasesData : [];
          state.pagination = {
            current_page: 1,
            total: state.items.length,
            per_page: 10,
            last_page: 1,
          };
        }
      })
      .addCase(fetchPurchases.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(addPurchase.fulfilled, (state, action: PayloadAction<Purchase>) => {
        state.items.push(action.payload);
      })
      .addCase(updatePurchase.fulfilled, (state, action: PayloadAction<Purchase>) => {
        const index = state.items.findIndex(p => (p.id || p.sl_no) === (action.payload.id || action.payload.sl_no));
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(deletePurchase.fulfilled, (state, action: PayloadAction<number>) => {
        state.items = state.items.filter(p => (p.id || p.sl_no) !== action.payload);
      });
  },
});

export default purchaseSlice.reducer;
