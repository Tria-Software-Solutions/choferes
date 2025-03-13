import axios from "axios";
import { refreshAccessToken } from "./userService";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(
  (config) => {
    const accessToken = sessionStorage.getItem("accessToken");
    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (
      error.response?.status === 401 &&
      error.response.data?.error === "Token expired"
    ) {
      try {
        const newAccessToken = await refreshAccessToken();
        error.config.headers["Authorization"] = `Bearer ${newAccessToken}`;
        return api.request(error.config);
      } catch (refreshError) {
        disconnectUser();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

const disconnectUser = () => {
  sessionStorage.clear();
  console.warn("Session expired. User disconnected.");
};

export default api;
