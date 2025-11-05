import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, Dog, LoginCredentials, RegisterData } from "../utils/types";
import { login as apiLogin, register as apiRegister, logout as apiLogout, getCurrentUser, getDogs, updateUser, getTrainers } from "../utils/api";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  dogs: Dog[];
  trainers: { id: string, name: string }[];
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  refreshDogs: () => Promise<void>;
  updateUserProfile: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [trainers, setTrainers] = useState<{ id: string, name: string }[]>([]);

  useEffect(() => {
    checkAuth();
    fetchTrainers();
  }, []);

  useEffect(() => {
    if (user) {
      refreshDogs();
    }
  }, [user]);

  const fetchTrainers = async () => {
    try {
      const trainerList = await getTrainers();
      setTrainers(trainerList);
    } catch (error) {
      console.error("Failed to fetch trainers:", error);
    }
  };

  const checkAuth = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error("Auth check failed:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      const newUser = (await apiLogin(credentials)).user;
      if (!newUser) {
        throw new Error("Login failed: No user returned");
      }
      setUser(newUser);
      await checkAuth();
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      await apiRegister(data);
      await checkAuth();
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    }
  };

  const logout = () => {
    apiLogout();
    setUser(null);
    setDogs([]);
  };

  const refreshDogs = async () => {
    try {
      const allDogs = await getDogs();
      setDogs(allDogs);
    } catch (error) {
      console.error("Failed to refresh dogs:", error);
    }
  };

  const updateUserProfile = async (updates: Partial<User>) => {
    if (!user) return;

    try {
      const updatedUser = await updateUser(user._id, updates);
      setUser(updatedUser);
    } catch (error) {
      console.error("Failed to update user profile:", error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    dogs,
    trainers,
    login,
    register,
    logout,
    refreshDogs,
    updateUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}