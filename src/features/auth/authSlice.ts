import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import api from '../../utils/api';

interface AuthState {
  user: any | null;
  token: string | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: AuthState = {
  user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') as string) : null,
  token: localStorage.getItem('token'),
  status: 'idle',
  error: null,
};

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials: { email: string; password: string; role: string }, { rejectWithValue }) => {
    try {
      const response = await api.post('/login', credentials);
      
      if (response.data.success) {
        const { access_token, user } = response.data;
        localStorage.setItem('token', access_token);
        localStorage.setItem('user', JSON.stringify(user));
        return { user, token: access_token };
      } else {
        return rejectWithValue(response.data.message || 'Login failed');
      }
    } catch (err: any) {
      if (err.response && err.response.data) {
        return rejectWithValue(err.response.data.message || 'Validation failed');
      }
      return rejectWithValue(err.message || 'Network error');
    }
  }
);

export const logoutUser = createAsyncThunk('auth/logoutUser', async (_, { dispatch }) => {
  try {
    await api.post('/logout');
  } catch (err) {
    console.error('Logout failed on server', err);
  } finally {
    dispatch(logout());
  }
});

export const sendOtp = createAsyncThunk(
  'auth/sendOtp',
  async (email: string, { rejectWithValue }) => {
    try {
      const response = await api.post('/forgot-password/send-otp', { email });
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to send OTP');
    }
  }
);

export const verifyOtp = createAsyncThunk(
  'auth/verifyOtp',
  async (data: { email: string; otp: string }, { rejectWithValue }) => {
    try {
      const response = await api.post('/forgot-password/verify-otp', data);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Invalid OTP');
    }
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await api.post('/forgot-password/reset', data);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Password reset failed');
    }
  }
);

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await api.post('/change-password', data);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Password change failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.status = 'idle';
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    resetError: (state) => {
      state.error = null;
      state.status = 'idle';
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<any>) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(loginUser.rejected, (state, action: PayloadAction<any>) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

export const { logout, resetError } = authSlice.actions;
export default authSlice.reducer;
