import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../lib/api";

export interface Transaction {
  id: string;
  reference: string;
  amount: string | number;
  type: string;
  status: string;
  description?: string;
  senderId?: string;
  receiverId?: string;
  createdAt: string;
  sender?: {
    firstName: string;
    lastName: string;
    email?: string;
    account?: {
      accountNumber: string;
    };
  };
  receiver?: {
    firstName: string;
    lastName: string;
    email?: string;
    account?: {
      accountNumber: string;
    };
  };
}

interface TransactionsState {
  transactions: Transaction[];
  isLoading: boolean;
}

export const fetchTransactions = createAsyncThunk(
  "transactions/fetchTransactions",
  async (): Promise<Transaction[]> => {
    const response = await api.get("/transactions");
    return response.data.transactions;
  },
);

const initialState: TransactionsState = {
  transactions: [],
  isLoading: false,
};

const transactionsSlice = createSlice({
  name: "transactions",

  initialState,

  reducers: {
    clearTransactions: (state) => {
      state.transactions = [];
      state.isLoading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransactions.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.transactions = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchTransactions.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export const { clearTransactions } = transactionsSlice.actions;

export default transactionsSlice.reducer;
