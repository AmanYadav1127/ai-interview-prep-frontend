import api from "./api";

export const login = async (credentials) => {
  const response = await api.post("/api/auth/login", credentials);
  const { token } = response.data;
  localStorage.setItem("token", token);
  return response.data;
};

export const signup = async (data) => {
  const response = await api.post("/api/auth/signup", data);
  return response.data;
};

export const logout = () => {
  localStorage.removeItem("token");
};

export const getMe = async () => {
  const response = await api.get("/api/user/me");
  return response.data;
};