import { createContext, useContext, useState } from "react";
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

  const login = async (email, password) => {
    const response = await loginService({
      email,
      password,
    });

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