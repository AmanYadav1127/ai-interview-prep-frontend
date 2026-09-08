import api from "./api";

export const signup = async (data) => {
  const response = await api.post("/api/auth/signup", data);
  return response.data;
};

export const login = async (data) => {
  const response = await api.post("/api/auth/login", data);

  if (response.data.token) {
    localStorage.setItem("token", response.data.token);
  }

  return response.data;
};

export const logout = () => {
  localStorage.removeItem("token");
};