import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import api from '../../utils/api';

export interface Admin {
  id: number;
  name: string;
  email: string;
  role: string;
  phone?: string;
  salary?: number;
  created_at?: string;
}

interface AdminState {
  items: Admin[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: AdminState = {
  items: [],
  status: 'idle',
  error: null,
};

export const fetchAdmins = createAsyncThunk('admins/fetchAdmins', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/admins');
    return response.data.admins || [];
  } catch (err: any) {
    return rejectWithValue(err.message);
  }
});

export const addAdmin = createAsyncThunk(
  'admins/addAdmin',
  async (newAdmin: any, { rejectWithValue }) => {
    try {
      const response = await api.post('/admins', newAdmin);
      return response.data.admin || response.data.user || newAdmin;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateAdmin = createAsyncThunk(
  'admins/updateAdmin',
  async ({ id, data }: { id: number; data: any }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/admins/${id}`, data);
      return response.data.admin || response.data.user || { id, ...data };
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const deleteAdmin = createAsyncThunk(
  'admins/deleteAdmin',
  async (id: number, { rejectWithValue }) => {
    try {
      await api.delete(`/admins/${id}`);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

const adminSlice = createSlice({
  name: 'admins',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdmins.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAdmins.fulfilled, (state, action: PayloadAction<Admin[]>) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchAdmins.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(addAdmin.fulfilled, (state, action: PayloadAction<Admin>) => {
        state.items.push(action.payload);
      })
      .addCase(updateAdmin.fulfilled, (state, action: PayloadAction<Admin>) => {
        const index = state.items.findIndex((a) => a.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = { ...state.items[index], ...action.payload };
        }
      })
      .addCase(deleteAdmin.fulfilled, (state, action: PayloadAction<number>) => {
        state.items = state.items.filter((a) => a.id !== action.payload);
      });
  },
});

export default adminSlice.reducer;
