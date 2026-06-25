import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import api from '../../utils/api';

export interface DailySaleSummary {
  id: number;
  date: string;
  rate_ms: number;
  rate_hsd: number;
  rate_xp: number;
  lubricant_sale: number;
  density: number;
  total_fuel_qty: number;
  ms_qty?: number;
  hsd_qty?: number;
  xp_qty?: number;
  ms_amount?: number;
  hsd_amount?: number;
  xp_amount?: number;
  total_fuel_amount: number;
  grand_total_amount: number;
  total_testing_amount: number;
  final_sale_amount: number;
  credit_payment_received: number;
  total_amount: number;
  ac_transfer: number;
  online: number;
  creditor: number;
  expense: number;
  staff: number;
  owner_1: number;
  owner_2: number;
  cash_to_be_collected: number;
  previous_pump_balance: number;
  cash_collection: number;
  coin: number;
  miss: number;
  expected_balance: number;
  actual_balance_in_pump: number;
  error: number;
}

export interface PreviousReading {
  nozzle_id: number;
  nozzle_no: string;
  fuel_type: string;
  previous_closing_reading: number;
}

export interface DailySaleDetail {
  id: number;
  date: string;
  rates: { MS: number; HSD: number; XP: number };
  lubricant_sale: number;
  nozzle_readings: {
    nozzle_id: number;
    nozzle_no: string;
    fuel_type: string;
    previous_closing_reading: number;
    closing_reading: number;
    sale_qty: number;
    amount: number;
  }[];
  fuel_summaries: {
    [key: string]: {
      total_qty: number;
      rate: number;
      amount: number;
    };
  };
  totals: {
    total_fuel_amount: number;
    total_fuel_qty?: number;
    ms_qty?: number;
    hsd_qty?: number;
    xp_qty?: number;
    ms_amount?: number;
    hsd_amount?: number;
    xp_amount?: number;
    lubricant_sale: number;
    grand_total_sale_amount: number;
  };
}

interface DailySalesState {
  items: DailySaleSummary[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  currentDetail: DailySaleDetail | null;
  detailStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  pagination: {
    current_page: number;
    total: number;
    per_page: number;
    last_page: number;
  };
}

const initialState: DailySalesState = {
  items: [],
  status: 'idle',
  error: null,
  currentDetail: null,
  detailStatus: 'idle',
  pagination: {
    current_page: 1,
    total: 0,
    per_page: 10,
    last_page: 1,
  },
};

export const fetchDailySales = createAsyncThunk(
  'dailySales/fetchDailySales',
  async (
    params: { start_date?: string; end_date?: string; per_page?: number; page?: number } | undefined,
    { rejectWithValue }
  ) => {
    try {
      const response = await api.get('/daily-sales', { params });
      return response.data.daily_sales;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchDailySaleDetails = createAsyncThunk('dailySales/fetchDailySaleDetails', async (id: number, { rejectWithValue }) => {
  try {
    const response = await api.get(`/daily-sales/${id}`);
    return response.data.report;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const addDailySale = createAsyncThunk('dailySales/addDailySale', async (data: any, { rejectWithValue }) => {
  try {
    const response = await api.post('/daily-sales', data);
    return response.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const updateDailySale = createAsyncThunk('dailySales/updateDailySale', async (data: { id: number, payload: any }, { rejectWithValue }) => {
  try {
    const response = await api.put(`/daily-sales/${data.id}`, data.payload);
    return response.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const deleteDailySale = createAsyncThunk('dailySales/deleteDailySale', async (id: number, { rejectWithValue }) => {
  try {
    await api.delete(`/daily-sales/${id}`);
    return id;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

const dailySalesSlice = createSlice({
  name: 'dailySales',
  initialState,
  reducers: {
    clearCurrentDetail: (state) => {
      state.currentDetail = null;
      state.detailStatus = 'idle';
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch List
      .addCase(fetchDailySales.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchDailySales.fulfilled, (state, action) => {
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
      .addCase(fetchDailySales.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      // Fetch Details
      .addCase(fetchDailySaleDetails.pending, (state) => {
        state.detailStatus = 'loading';
      })
      .addCase(fetchDailySaleDetails.fulfilled, (state, action: PayloadAction<DailySaleDetail>) => {
        state.detailStatus = 'succeeded';
        state.currentDetail = action.payload;
      })
      .addCase(fetchDailySaleDetails.rejected, (state, action) => {
        state.detailStatus = 'failed';
        state.error = action.payload as string;
      })
      // Add/Update
      .addCase(addDailySale.fulfilled, (state) => {
        state.status = 'idle';
      })
      .addCase(updateDailySale.fulfilled, (state) => {
        state.status = 'idle';
      })
      // Delete
      .addCase(deleteDailySale.fulfilled, (state, action: PayloadAction<number>) => {
        state.items = state.items.filter(item => item.id !== action.payload);
      });
  },
});

export const { clearCurrentDetail } = dailySalesSlice.actions;
export default dailySalesSlice.reducer;
