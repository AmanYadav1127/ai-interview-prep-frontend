import api from "./api";

export const getInterviews = async () => {
  const response = await api.get("/api/interviews");
  return response.data;
};

export const createInterview = async (data) => {
  const response = await api.post("/api/interviews", data);
  return response.data;
};