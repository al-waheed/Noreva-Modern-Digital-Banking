import { configureStore } from "@reduxjs/toolkit";
import dashboardReducer from "./slices/dashboardSlice";
import notificationReducer from "./slices/notificationSlice";
import scheduledPaymentsReducer from "./slices/scheduledPaymentsSlice";
import transactionsReducer from "./slices/transactionsSlice";

export const store = configureStore({
  reducer: {
    dashboard: dashboardReducer,
    notifications: notificationReducer,
    scheduledPayments: scheduledPaymentsReducer,
    transactions: transactionsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;