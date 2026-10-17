import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface ScheduledPayment {
  id: string;
  amount: string | number;
  description?: string | null;
  createdAt: string;
  scheduledFor: string;
  status: string;
  receiver?: {
    firstName: string;
    lastName: string;
    email: string;
    account?: {
      accountNumber: string;
    };
  };
}

interface ScheduledPaymentsState {
  payments: ScheduledPayment[];
  isLoading: boolean;
}

const initialState: ScheduledPaymentsState = {
  payments: [],
  isLoading: false,
};

const scheduledPaymentsSlice = createSlice({
  name: "scheduledPayments",

  initialState,

  reducers: {
    setScheduledPayments: (
      state,
      action: PayloadAction<ScheduledPayment[]>,
    ) => {
      state.payments = action.payload;
      state.isLoading = false;
    },

    addScheduledPayment: (state, action: PayloadAction<ScheduledPayment>) => {
      state.payments.unshift(action.payload);
    },

    updateScheduledPayment: (
      state,
      action: PayloadAction<ScheduledPayment>,
    ) => {
      const payment = state.payments.find(
        (item) => item.id === action.payload.id,
      );

      if (payment) {
        Object.assign(payment, action.payload);
      }
    },

    setScheduledPaymentsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    clearScheduledPayments: (state) => {
      state.payments = [];
      state.isLoading = false;
    },
  },
});

export const {
  setScheduledPayments,
  addScheduledPayment,
  updateScheduledPayment,
  setScheduledPaymentsLoading,
  clearScheduledPayments,
} = scheduledPaymentsSlice.actions;

export default scheduledPaymentsSlice.reducer;
