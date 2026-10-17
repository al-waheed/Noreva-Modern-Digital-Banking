import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { useDispatch } from "react-redux";
import api from "../lib/api";
import type { AppDispatch } from "../store/store";

import {
  clearDashboardData,
  fetchDashboardData,
} from "../store/slices/dashboardSlice";

import { clearTransactions } from "../store/slices/transactionsSlice";

import { clearScheduledPayments } from "../store/slices/scheduledPaymentsSlice";

import { clearNotifications } from "../store/slices/notificationSlice";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  accountNumber?: string;
  hasTransactionPin?: boolean;
  cards?: {
    id: string;
    cardNumber: string;
    expiryMonth: number;
    expiryYear: number;
    cvv: string;
    type: string;
    status: string;
  }[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    firstName: string,
    lastName: string,
    email: string,
    phone: string,
    password: string,
  ) => Promise<void>;
  createTransactionPin: (pin: string) => Promise<void>;
  refreshUser: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const dispatch = useDispatch<AppDispatch>();

  const [user, setUser] = useState<User | null>(null);

  const [token, setToken] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    if (!token) {
      return;
    }

    const response = await api.get("/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setUser(response.data.user);
  }, [token]);

  useEffect(() => {
    const initializeApp = async () => {
      if (!token) {
        dispatch(clearDashboardData());
        dispatch(clearTransactions());
        dispatch(clearScheduledPayments());
        dispatch(clearNotifications());

        setIsLoading(false);
        return;
      }

      try {
        await refreshUser();
        await dispatch(fetchDashboardData(token)).unwrap();
      } catch (error) {
        console.log(error);

        setToken(null);
        setUser(null);

        dispatch(clearDashboardData());
        dispatch(clearTransactions());
        dispatch(clearScheduledPayments());
        dispatch(clearNotifications());
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, [token, refreshUser, dispatch]);

  const login = async (email: string, password: string) => {
    const response = await api.post("/auth/login", {
      email,
      password,
    });

    const newToken = response.data.token;

    setIsLoading(true);
    setToken(newToken);
    setUser(response.data.user);
  };

  const register = async (
    firstName: string,
    lastName: string,
    email: string,
    phone: string,
    password: string,
  ) => {
    const response = await api.post("/auth/register", {
      firstName,
      lastName,
      email,
      phone,
      password,
    });

    const newToken = response.data.token;

    setIsLoading(true);
    setToken(newToken);
    setUser(response.data.user);
  };

  const createTransactionPin = async (pin: string) => {
    if (!token) {
      throw new Error("Authentication required");
    }

    await api.post(
      "/auth/transaction-pin",
      {
        pin,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    setUser((currentUser) =>
      currentUser
        ? {
            ...currentUser,
            hasTransactionPin: true,
          }
        : currentUser,
    );
  };

  const logout = () => {
    setToken(null);
    setUser(null);

    // Clear all user-specific Redux data.
    dispatch(clearDashboardData());
    dispatch(clearTransactions());
    dispatch(clearScheduledPayments());
    dispatch(clearNotifications());
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        createTransactionPin,
        refreshUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};
