import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface Transaction {
  id: string;
  reference?: string;
  amount: number;
  createdAt: string;
  type?: string;
  status?: string;
  description?: string;
  senderId: string;
  receiverId: string;
  walletId?: string;
  sender?: {
    firstName: string;
    lastName: string;
  };
  receiver?: {
    firstName: string;
    lastName: string;
  };
}

interface MonthlyActivity {
  month: string;
  amount: number;
}

interface DashboardData {
  balance: number;
  moneyReceived: number;
  moneySent: number;
  transactionCount: number;
  monthlyActivity: MonthlyActivity[];
  recentTransactions: Transaction[];
}

interface DashboardState {
  data: DashboardData | null;
}

const initialState: DashboardState = {
  data: null,
};

const dashboardSlice = createSlice({
  name: "dashboard",

  initialState,

  reducers: {
    setDashboardData: (state, action: PayloadAction<DashboardData>) => {
      state.data = action.payload;
    },

    updateBalance: (state, action: PayloadAction<number>) => {
      if (state.data) {
        state.data.balance = action.payload;
      }
    },

    updateFinancialData: (
      state,
      action: PayloadAction<Partial<DashboardData>>,
    ) => {
      if (state.data) {
        state.data = {
          ...state.data,
          ...action.payload,
        };
      }
    },

    applyOutgoingTransfer: (
      state,
      action: PayloadAction<{
        balance: number;
        amount: number;
        transaction: Transaction;
        recipient: {
          firstName: string;
          lastName: string;
        };
      }>,
    ) => {
      if (!state.data) {
        return;
      }

      const { balance, amount, transaction, recipient } = action.payload;

      // Update balance
      state.data.balance = balance;

      // Update monthly sent amount
      state.data.moneySent += amount;

      // Update transaction count
      state.data.transactionCount += 1;

      // Add the new transaction to recent transactions
      state.data.recentTransactions = [
        {
          ...transaction,
          receiver: {
            firstName: recipient.firstName,
            lastName: recipient.lastName,
          },
        },
        ...state.data.recentTransactions,
      ].slice(0, 10);

      // Update the current month's chart amount
      const currentMonth = new Date().toLocaleString("en-US", {
        month: "short",
      });

      const currentMonthActivity = state.data.monthlyActivity.find(
        (item) => item.month === currentMonth,
      );

      if (currentMonthActivity) {
        currentMonthActivity.amount += amount;
      }
    },

    clearDashboardData: (state) => {
      state.data = null;
    },
  },
});

export const {
  setDashboardData,
  updateBalance,
  updateFinancialData,
  applyOutgoingTransfer,
  clearDashboardData,
} = dashboardSlice.actions;

export default dashboardSlice.reducer;
