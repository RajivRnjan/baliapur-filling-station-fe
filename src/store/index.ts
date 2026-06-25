import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import nozzleReducer from '../features/nozzles/nozzleSlice';
import purchaseReducer from '../features/purchases/purchaseSlice';
import adminReducer from '../features/admins/adminSlice';
import dailySalesReducer from '../features/dailySales/dailySalesSlice';
import lubricantReducer from '../features/lubricants/lubricantSlice';
import creditorReducer from '../features/creditors/creditorSlice';
import dashboardReducer from '../features/dashboard/dashboardSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    nozzles: nozzleReducer,
    purchases: purchaseReducer,
    admins: adminReducer,
    dailySales: dailySalesReducer,
    lubricants: lubricantReducer,
    creditors: creditorReducer,
    dashboard: dashboardReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

