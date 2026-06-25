import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import api from '../../utils/api';

export interface Creditor {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  opening_balance: string | number;
  current_balance: string | number;
  created_at?: string;
  updated_at?: string;
}

export interface LedgerTransaction {
  id: number | null;
  date: string;
  credit_amount: number;
  payment_amount: number;
  balance: number;
  remark: string;
  is_opening: boolean;
}

interface CreditorState {
  items: Creditor[];
  selectedCreditor: Creditor | null;
  selectedLedger: LedgerTransaction[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  ledgerStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  pagination: {
    current_page: number;
    total: number;
    per_page: number;
    last_page: number;
  };
}

const initialState: CreditorState = {
  items: [],
  selectedCreditor: null,
  selectedLedger: [],
  status: 'idle',
  ledgerStatus: 'idle',
  error: null,
  pagination: {
    current_page: 1,
    total: 0,
    per_page: 10,
    last_page: 1,
  },
};

export const fetchCreditors = createAsyncThunk(
  'creditors/fetchCreditors',
  async (
    params: { search?: string; per_page?: number; page?: number } | undefined,
    { rejectWithValue }
  ) => {
    try {
      const response = await api.get('/creditors', { params });
      return response.data.creditors;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch creditors');
    }
  }
);

export const addCreditor = createAsyncThunk(
  'creditors/addCreditor',
  async (newCreditor: Omit<Creditor, 'id' | 'current_balance'>, { rejectWithValue }) => {
    try {
      const response = await api.post('/creditors', newCreditor);
      return response.data.creditor || response.data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to add creditor profile');
    }
  }
);

export const updateCreditor = createAsyncThunk(
  'creditors/updateCreditor',
  async ({ id, ...updatedData }: Partial<Creditor> & { id: number }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/creditors/${id}`, updatedData);
      return response.data.creditor || response.data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to update creditor details');
    }
  }
);

export const deleteCreditor = createAsyncThunk(
  'creditors/deleteCreditor',
  async (id: number, { rejectWithValue }) => {
    try {
      await api.delete(`/creditors/${id}`);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to delete creditor');
    }
  }
);

export const fetchLedger = createAsyncThunk(
  'creditors/fetchLedger',
  async (creditorId: number, { rejectWithValue }) => {
    try {
      const response = await api.get(`/creditors/${creditorId}/ledger`);
      return {
        creditor: response.data.creditor,
        ledger: response.data.ledger || [],
      };
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch ledger');
    }
  }
);

export const addTransaction = createAsyncThunk(
  'creditors/addTransaction',
  async (
    { creditorId, date, credit_amount, payment_amount, remark }: { creditorId: number; date: string; credit_amount: number; payment_amount: number; remark?: string },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const response = await api.post(`/creditors/${creditorId}/transactions`, {
        date,
        credit_amount,
        payment_amount,
        remark,
      });
      // Refetch ledger and creditors list to ensure running balances are in sync
      dispatch(fetchLedger(creditorId));
      dispatch(fetchCreditors());
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to record transaction');
    }
  }
);

export const updateTransaction = createAsyncThunk(
  'creditors/updateTransaction',
  async (
    { creditorId, transactionId, date, credit_amount, payment_amount, remark }: { creditorId: number; transactionId: number; date: string; credit_amount: number; payment_amount: number; remark?: string },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const response = await api.put(`/creditors/transactions/${transactionId}`, {
        date,
        credit_amount,
        payment_amount,
        remark,
      });
      // Refetch ledger and creditors list to ensure running balances are in sync
      dispatch(fetchLedger(creditorId));
      dispatch(fetchCreditors());
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to update transaction');
    }
  }
);

export const deleteTransaction = createAsyncThunk(
  'creditors/deleteTransaction',
  async (
    { creditorId, transactionId }: { creditorId: number; transactionId: number },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const response = await api.delete(`/creditors/transactions/${transactionId}`);
      // Refetch ledger and creditors list to ensure running balances are in sync
      dispatch(fetchLedger(creditorId));
      dispatch(fetchCreditors());
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to delete transaction');
    }
  }
);

const creditorSlice = createSlice({
  name: 'creditors',
  initialState,
  reducers: {
    clearSelectedLedger: (state) => {
      state.selectedCreditor = null;
      state.selectedLedger = [];
      state.ledgerStatus = 'idle';
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Creditors
      .addCase(fetchCreditors.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCreditors.fulfilled, (state, action) => {
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
      .addCase(fetchCreditors.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      // Add Creditor
      .addCase(addCreditor.fulfilled, (state, action: PayloadAction<Creditor>) => {
        state.items.push(action.payload);
      })
      // Update Creditor
      .addCase(updateCreditor.fulfilled, (state, action: PayloadAction<Creditor>) => {
        const index = state.items.findIndex((c) => c.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.selectedCreditor?.id === action.payload.id) {
          state.selectedCreditor = action.payload;
        }
      })
      // Delete Creditor
      .addCase(deleteCreditor.fulfilled, (state, action: PayloadAction<number>) => {
        state.items = state.items.filter((c) => c.id !== action.payload);
        if (state.selectedCreditor?.id === action.payload) {
          state.selectedCreditor = null;
          state.selectedLedger = [];
        }
      })
      // Fetch Ledger
      .addCase(fetchLedger.pending, (state) => {
        state.ledgerStatus = 'loading';
      })
      .addCase(fetchLedger.fulfilled, (state, action: PayloadAction<{ creditor: Creditor; ledger: LedgerTransaction[] }>) => {
        state.ledgerStatus = 'succeeded';
        state.selectedCreditor = action.payload.creditor;
        state.selectedLedger = action.payload.ledger;
      })
      .addCase(fetchLedger.rejected, (state, action) => {
        state.ledgerStatus = 'failed';
        state.error = action.payload as string;
      });
  },
});

export const { clearSelectedLedger } = creditorSlice.actions;
export default creditorSlice.reducer;
