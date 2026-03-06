import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { authApi } from "../services/api";
import type {
  AuthContextType,
  UserPublic,
  LoginPayload,
  RegisterPayload,
} from "../types";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_TOKEN_KEY = "atlass_token";
const STORAGE_USER_KEY = "atlass_user";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserPublic | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load stored auth on mount
  useEffect(() => {
    const storedToken = localStorage.getItem(STORAGE_TOKEN_KEY);
    const storedUser = localStorage.getItem(STORAGE_USER_KEY);

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem(STORAGE_TOKEN_KEY);
        localStorage.removeItem(STORAGE_USER_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    const authResponse = await authApi.login(payload);
    setToken(authResponse.token);
    setUser(authResponse.user);
    localStorage.setItem(STORAGE_TOKEN_KEY, authResponse.token);
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(authResponse.user));
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    const authResponse = await authApi.register(payload);
    setToken(authResponse.token);
    setUser(authResponse.user);
    localStorage.setItem(STORAGE_TOKEN_KEY, authResponse.token);
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(authResponse.user));
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(STORAGE_TOKEN_KEY);
    localStorage.removeItem(STORAGE_USER_KEY);
  }, []);

  const loginWithToken = useCallback((newToken: string, newUser: UserPublic) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem(STORAGE_TOKEN_KEY, newToken);
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(newUser));
  }, []);

  const contextValue: AuthContextType = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    login,
    register,
    loginWithToken,
    logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
