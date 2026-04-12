import axios from "axios";
import Cookies from "js-cookie";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const requestCache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
  timeout: 60000, // 60 segundos timeout (Render gratuito necesita tiempo para cold start)
  maxRedirects: 5,
  maxContentLength: 50 * 1024 * 1024, // 50MB
});

api.interceptors.request.use(
  (config) => {
    const accessToken = Cookies.get("accessToken");
    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }

    if (config.method === "get" && !config.headers["x-no-cache"]) {
      const cacheKey = `${config.url}${JSON.stringify(config.params || {})}`;
      const cached = requestCache.get(cacheKey);

      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        const cachedResponse = {
          data: cached.data,
          status: 200,
          statusText: "OK",
          headers: {},
          config,
        };

        const error = new Error("CACHED_RESPONSE");
        (error as { cachedResponse?: unknown }).cachedResponse = cachedResponse;
        throw error;
      }
    }

    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => {
    if (response.config.method === "get" && response.status === 200) {
      const cacheKey = `${response.config.url}${JSON.stringify(response.config.params || {})}`;
      requestCache.set(cacheKey, {
        data: response.data,
        timestamp: Date.now(),
      });
    }
    return response;
  },
  async (error) => {
    if (error.message === "CACHED_RESPONSE" && error.cachedResponse) {
      return error.cachedResponse;
    }

    if (error.response?.status === 401) {
      // Try to refresh token first
      const refreshToken = Cookies.get("refreshToken");
      if (refreshToken && error.response.data?.error === "Token expired") {
        try {
          const response = await axios.post(
            `${API_URL}/api/auth/refresh-token`,
            {},
            {
              withCredentials: true,
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${refreshToken}`,
              },
            },
          );

          const newAccessToken = response.data.accessToken;
          Cookies.set("accessToken", newAccessToken);
          error.config.headers["Authorization"] = `Bearer ${newAccessToken}`;
          return api.request(error.config);
        } catch (refreshError) {
          disconnectUser();
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token or not a token expired error, redirect to login
        disconnectUser();
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  },
);

export const clearApiCache = () => {
  requestCache.clear();
};

export const invalidateCache = (url: string) => {
  for (const [key] of requestCache) {
    if (key.includes(url)) {
      requestCache.delete(key);
    }
  }
};

const disconnectUser = () => {
  Cookies.remove("accessToken");
  Cookies.remove("refreshToken");
  sessionStorage.clear();
  localStorage.clear();

  window.location.href = "/session-expired";
};

export default api;
