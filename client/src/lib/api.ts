import axios from "axios";

const api = axios.create({
  baseURL: "https://noreva-modern-digital-banking.onrender.com/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const request = error.config;
    const isPublicAuthEndpoint =
      request?.url &&
      /\/auth\/(login|register|forgot-password|reset-password|logout)$/.test(
        request.url,
      );

    if (
      error.response?.status !== 401 ||
      !request ||
      isPublicAuthEndpoint
    ) {
      return Promise.reject(error);
    }

    window.dispatchEvent(new Event("auth:session-expired"));
    return Promise.reject(error);
  },
);

export default api;