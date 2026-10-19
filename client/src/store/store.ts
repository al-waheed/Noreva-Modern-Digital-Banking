import { configureStore } from "@reduxjs/toolkit";
import dashboardReducer from "./slices/dashboardSlice";
import notificationReducer from "./slices/notificationSlice";
import transactionsReducer from "./slices/transactionsSlice";

export const store = configureStore({
  reducer: {
    dashboard: dashboardReducer,
    notifications: notificationReducer,
    transactions: transactionsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;