import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

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

const initialState: TransactionsState = {
  transactions: [],
  isLoading: false,
};

const transactionsSlice = createSlice({
  name: "transactions",

  initialState,

  reducers: {
    setTransactions: (state, action: PayloadAction<Transaction[]>) => {
      state.transactions = action.payload;
      state.isLoading = false;
    },

    setTransactionsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    clearTransactions: (state) => {
      state.transactions = [];
      state.isLoading = false;
    },
  },
});

export const {
  setTransactions,
  setTransactionsLoading,
  clearTransactions,
} = transactionsSlice.actions;

export default transactionsSlice.reducer;
