import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import api from '../../utils/api';

interface Nozzle {
  id: number;
  nozzle_no: string;
  fuel_type: string;
  opening_reading?: number;
  created_at?: string;
  updated_at?: string;
}

interface NozzleState {
  items: Nozzle[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  pagination: {
    current_page: number;
    total: number;
    per_page: number;
    last_page: number;
  };
}

const initialState: NozzleState = {
  items: [],
  status: 'idle',
  error: null,
  pagination: {
    current_page: 1,
    total: 0,
    per_page: 10,
    last_page: 1,
  },
};

export const fetchNozzles = createAsyncThunk(
  'nozzles/fetchNozzles',
  async (params: { fuel_type?: string; per_page?: number; page?: number } | undefined, { rejectWithValue }) => {
    try {
      const response = await api.get('/nozzles', { params });
      return response.data.nozzles;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const addNozzle = createAsyncThunk(
  'nozzles/addNozzle',
  async (newNozzle: { nozzle_no: string; fuel_type: string; opening_reading: number }, { rejectWithValue }) => {
    try {
      const response = await api.post('/nozzles', newNozzle);
      return response.data.nozzle;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateNozzle = createAsyncThunk(
  'nozzles/updateNozzle',
  async (data: { id: number; nozzle_no: string; fuel_type: string; opening_reading: number }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/nozzles/${data.id}`, data);
      return response.data.nozzle;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const deleteNozzle = createAsyncThunk(
  'nozzles/deleteNozzle',
  async (id: number, { rejectWithValue }) => {
    try {
      await api.delete(`/nozzles/${id}`);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

const nozzleSlice = createSlice({
  name: 'nozzles',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNozzles.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchNozzles.fulfilled, (state, action) => {
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
      .addCase(fetchNozzles.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(addNozzle.fulfilled, (state, action: PayloadAction<Nozzle>) => {
        state.items.push(action.payload);
      })
      .addCase(updateNozzle.fulfilled, (state, action: PayloadAction<Nozzle>) => {
        const index = state.items.findIndex(n => n.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(deleteNozzle.fulfilled, (state, action: PayloadAction<number>) => {
        state.items = state.items.filter(n => n.id !== action.payload);
      });
  },
});

export default nozzleSlice.reducer;
