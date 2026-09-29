import api from "./api";

export const getInterviews = async () => {
  const response = await api.get("/api/interviews");
  return response.data;
};

export const createInterview = async (data) => {
  const response = await api.post("/api/interviews", data);
  return response.data;
};

export const getInterviewById = async (id) => {
  const response = await api.get(`/api/interviews/${id}`);
  return response.data;
};

export const getInterviewResult = async (id) => {
  const response = await api.get(`/api/interviews/${id}/result`);
  return response.data;
};