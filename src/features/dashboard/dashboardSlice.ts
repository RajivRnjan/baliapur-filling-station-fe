import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import api from '../../utils/api';

export interface FuelRemaining {
  MS?: number;
  NS?: number;
  HSD: number;
  XP: number;
  total: number;
}

export interface LubricantStock {
  id: number;
  name: string;
  qty_name: string;
  stock: number;
  price: string | number;
}

export interface SalesOverview {
  today_sales: number;
  this_week_sales: number;
  this_quarter_sales: number;
  grand_total_sales: number;
}

export interface DashboardStats {
  fuel_remaining: FuelRemaining;
  lubricant_stock: LubricantStock[];
  sales_overview: SalesOverview;
}

export interface SalesAggregate {
  period: string;
  raw_date?: string;
  fuel_sales: number;
  lubricant_sales: number;
  total_sales: number;
  credit_sales: number;
  cash_collected: number;
}

interface DashboardState {
  stats: DashboardStats | null;
  statsStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  sales: SalesAggregate[];
  salesStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  groupBy: 'day' | 'week' | 'quarter';
  pagination: {
    current_page: number;
    total: number;
    per_page: number;
    last_page: number;
  };
  error: string | null;
}

const initialState: DashboardState = {
  stats: null,
  statsStatus: 'idle',
  sales: [],
  salesStatus: 'idle',
  groupBy: 'day',
  pagination: {
    current_page: 1,
    total: 0,
    per_page: 10,
    last_page: 1,
  },
  error: null,
};

export const fetchDashboardStats = createAsyncThunk(
  'dashboard/fetchStats',
  async (dateFilter: string | undefined, { rejectWithValue }) => {
    try {
      const params = dateFilter ? { date: dateFilter } : {};
      const response = await api.get('/dashboard/stats', { params });
      return response.data.stats;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch dashboard stats');
    }
  }
);

export const fetchDashboardSales = createAsyncThunk(
  'dashboard/fetchSales',
  async (
    params: { group_by?: string; start_date?: string; end_date?: string; per_page?: number; page?: number } | undefined,
    { rejectWithValue }
  ) => {
    try {
      const response = await api.get('/dashboard/sales', { params });
      return {
        sales: response.data.sales,
        group_by: response.data.group_by || params?.group_by || 'day',
      };
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch sales aggregates');
    }
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Stats
      .addCase(fetchDashboardStats.pending, (state) => {
        state.statsStatus = 'loading';
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action: PayloadAction<DashboardStats>) => {
        state.statsStatus = 'succeeded';
        state.stats = action.payload;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.statsStatus = 'failed';
        state.error = action.payload as string;
      })
      // Fetch Sales
      .addCase(fetchDashboardSales.pending, (state) => {
        state.salesStatus = 'loading';
      })
      .addCase(fetchDashboardSales.fulfilled, (state, action) => {
        state.salesStatus = 'succeeded';
        state.groupBy = action.payload.group_by as 'day' | 'week' | 'quarter';
        
        const paginatedData = action.payload.sales;
        if (paginatedData && paginatedData.data) {
          state.sales = paginatedData.data;
          state.pagination = {
            current_page: paginatedData.current_page || 1,
            total: paginatedData.total || 0,
            per_page: paginatedData.per_page || 10,
            last_page: paginatedData.last_page || Math.ceil((paginatedData.total || 0) / (paginatedData.per_page || 10)),
          };
        } else {
          state.sales = Array.isArray(paginatedData) ? paginatedData : [];
          state.pagination = {
            current_page: 1,
            total: state.sales.length,
            per_page: 10,
            last_page: 1,
          };
        }
      })
      .addCase(fetchDashboardSales.rejected, (state, action) => {
        state.salesStatus = 'failed';
        state.error = action.payload as string;
      });
  },
});

export default dashboardSlice.reducer;
