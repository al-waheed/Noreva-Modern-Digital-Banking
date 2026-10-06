import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface ScheduledPayment {
  id: string;
  amount: string | number;
  description?: string | null;
  scheduledFor: string;
  frequency: "ONCE" | "DAILY" | "WEEKLY" | "MONTHLY";
  status: string;
  receiver?: {
    firstName: string;
    lastName: string;
    email: string;
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
      state.payments.push(action.payload);
    },

    cancelScheduledPayment: (state, action: PayloadAction<string>) => {
      const payment = state.payments.find((item) => item.id === action.payload);

      if (payment) {
        payment.status = "FAILED";
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
  cancelScheduledPayment,
  setScheduledPaymentsLoading,
  clearScheduledPayments,
} = scheduledPaymentsSlice.actions;

export default scheduledPaymentsSlice.reducer;
