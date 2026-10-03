import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import api from "../lib/api";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
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
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token"),
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await api.get("/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUser(response.data.user);
      } catch (e) {
        console.log(e);
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  const login = async (email: string, password: string) => {
    const response = await api.post("/auth/login", {
      email,
      password,
    });

    const newToken = response.data.token;

    localStorage.setItem("token", newToken);
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

    localStorage.setItem("token", newToken);
    setToken(newToken);
    setUser(response.data.user);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
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
