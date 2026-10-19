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

import { clearDashboardData } from "../store/slices/dashboardSlice";

import { clearTransactions } from "../store/slices/transactionsSlice";

import { clearNotifications } from "../store/slices/notificationSlice";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  accountNumber?: string;
  balance?: number;
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
  changeTransactionPin: (currentPin: string, newPin: string) => Promise<void>;
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
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const response = await api.get("/auth/me");

    setUser(response.data.user);
  }, []);

  const clearUserData = useCallback(() => {
    setUser(null);
    dispatch(clearDashboardData());
    dispatch(clearTransactions());
    dispatch(clearNotifications());
  }, [dispatch]);

  useEffect(() => {
    let isActive = true;

    const initializeApp = async () => {
      try {
        await refreshUser();
      } catch (error) {
        if (!isActive) return;

        const status = (error as { response?: { status?: number } }).response
          ?.status;
        if (status === 401) {
          clearUserData();
        } else {
          console.error("Unable to restore the signed-in user:", error);
        }
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    void initializeApp();

    return () => {
      isActive = false;
    };
  }, [refreshUser, clearUserData]);

  useEffect(() => {
    const handleSessionExpired = () => {
      clearUserData();
      void api.post("/auth/logout").catch(() => undefined);
    };

    window.addEventListener("auth:session-expired", handleSessionExpired);
    return () => {
      window.removeEventListener("auth:session-expired", handleSessionExpired);
    };
  }, [clearUserData]);

  const login = async (email: string, password: string) => {
    await api.post("/auth/login", {
      email,
      password,
    });

    await refreshUser();
  };

  const register = async (
    firstName: string,
    lastName: string,
    email: string,
    phone: string,
    password: string,
  ) => {
    await api.post("/auth/register", {
      firstName,
      lastName,
      email,
      phone,
      password,
    });

    await refreshUser();
  };

  const createTransactionPin = async (pin: string) => {
    await api.post("/auth/transaction-pin", { pin });

    setUser((currentUser) =>
      currentUser
        ? {
            ...currentUser,
            hasTransactionPin: true,
          }
        : currentUser,
    );
  };

  const changeTransactionPin = async (
    currentPin: string,
    newPin: string,
  ) => {
    await api.post("/auth/transaction-pin/change", {
      currentPin,
      newPin,
    });
  };

  const logout = () => {
    void api.post("/auth/logout").catch((error) =>
      console.error("Unable to clear the server session:", error),
    );
    clearUserData();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        createTransactionPin,
        changeTransactionPin,
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
