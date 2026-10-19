import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import api from "../../lib/api";

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

export const fetchDashboardData = createAsyncThunk(
  "dashboard/fetchDashboardData",
  async (): Promise<DashboardData> => {
    const response = await api.get("/dashboard");

    const dashboard = response.data;

    return {
      balance: Number(dashboard.account.balance),
      moneyReceived: Number(dashboard.stats.moneyReceived),
      moneySent: Number(dashboard.stats.moneySent),
      transactionCount: Number(dashboard.stats.transactionCount),
      monthlyActivity: dashboard.monthlyActivity,
      recentTransactions: dashboard.transactions,
    };
  },
);

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
    clearDashboardData: (state) => {
      state.data = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchDashboardData.fulfilled, (state, action) => {
      state.data = action.payload;
    });
  },
});

export const { setDashboardData, clearDashboardData } = dashboardSlice.actions;

export default dashboardSlice.reducer;
