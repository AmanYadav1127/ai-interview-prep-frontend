import { createContext, useContext, useEffect, useRef, useState } from "react";
import { login as loginService, logout as logoutService } from "../services/authService";

const AuthContext = createContext();

const isTokenValid = (t) => {
  return Boolean(
    t &&
    typeof t === "string" &&
    t !== "null" &&
    t !== "undefined" &&
    t.trim().length > 10
  );
};

export function AuthProvider({ children }) {
  const initialToken = localStorage.getItem("token");
  const [token, setToken] = useState(isTokenValid(initialToken) ? initialToken : null);
  // initializing = true means we're still on first render, don't redirect yet
  const [initializing, setInitializing] = useState(true);
  const mountedRef = useRef(false);

  useEffect(() => {
    // After first mount the token is already read synchronously from localStorage
    if (!mountedRef.current) {
      mountedRef.current = true;
      setInitializing(false);
    }
  }, []);

  const login = async (email, password) => {
    const response = await loginService({ email, password });
    if (response?.token) {
      setToken(response.token);
      localStorage.setItem("token", response.token);
    }
    return response;
  };

  const logout = () => {
    logoutService();
    setToken(null);
  };

  const isAuthenticated = isTokenValid(token);

  return (
    <AuthContext.Provider
      value={{
        token,
        isAuthenticated,
        initializing,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}