import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (
        error.response.data &&
        error.response.data.message === "Token expired due to inactivity"
      ) {
        logoutUser();
      }
    }
    return Promise.reject(error);
  }
);

const logoutUser = () => {
  sessionStorage.removeItem("currentUser");
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("userPermissions");
  window.location.href = "/";
};

export default api;
