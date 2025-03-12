import axios from "axios";
import Cookies from "js-cookie";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = Cookies.get("accessToken");
    console.log("token from api (ui): ", token);
    if (token) {
      console.log("enter if(token) api(ui)");
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    console.log("config from api (ui): ", config);
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        if (
          error.response.data?.message === "Token expired due to inactivity"
        ) {
          try {
            const refreshToken = Cookies.get("refreshToken");

            if (!refreshToken) {
              throw new Error("No refresh token available");
            }

            const refreshResponse = await axios.post(
              `${API_URL}/api/refresh-token`,
              {},
              { withCredentials: true }
            );

            const newAccessToken = refreshResponse.data.accessToken;
            Cookies.set("accessToken", newAccessToken, { expires: 1 });

            error.config.headers["Authorization"] = `Bearer ${newAccessToken}`;
            return axios(error.config);
          } catch (refreshError) {
            logoutUser();
            return Promise.reject(refreshError);
          }
        }
      }
    }
    return Promise.reject(error);
  }
);

const logoutUser = () => {
  Cookies.remove("accessToken");
  Cookies.remove("refreshToken");
  sessionStorage.removeItem("currentUser");
  sessionStorage.removeItem("userPermissions");
  window.location.href = "/";
};

export default api;
