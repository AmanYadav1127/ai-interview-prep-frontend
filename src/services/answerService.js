import api from "./api";

export const startInterview = async (interviewId) => {
  const response = await api.post(`/api/interviews/${interviewId}/start`);
  return response.data;
};

export const submitAnswer = async (questionId, answerText) => {
  const response = await api.post(`/api/answers/${questionId}`, {
    answerText,
  });
  return response.data;
};

export const completeInterview = async (interviewId) => {
  const response = await api.post(`/api/interviews/${interviewId}/complete`);
  return response.data;
};