import axios from "axios";
import Cookies from "js-cookie";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

// Helper functions for token storage with localStorage fallback
const setTokenWithFallback = (key: string, value: string, options?: any) => {
  try {
    // Try to set cookie first
    Cookies.set(key, value, options);
    // Also store in localStorage as backup
    localStorage.setItem(key, value);
  } catch (error) {
    // Fallback to localStorage only
    localStorage.setItem(key, value);
  }
};

const getTokenWithFallback = (key: string): string | null => {
  try {
    // Try to get from cookie first
    const cookieValue = Cookies.get(key);
    if (cookieValue) return cookieValue;
    
    // Fallback to localStorage
    return localStorage.getItem(key);
  } catch (error) {
    // Fallback to localStorage only
    return localStorage.getItem(key);
  }
};

const removeTokenWithFallback = (key: string, options?: any) => {
  try {
    // Try to remove from cookie first
    Cookies.remove(key, options);
    // Also remove from localStorage
    localStorage.removeItem(key);
  } catch (error) {
    // Fallback to localStorage only
    localStorage.removeItem(key);
  }
};

const requestCache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
  timeout: 60000,
  maxRedirects: 5,
  maxContentLength: 50 * 1024 * 1024, // 50MB
});

api.interceptors.request.use(
  (config) => {
    const accessToken = getTokenWithFallback("accessToken");
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
      const refreshToken = getTokenWithFallback("refreshToken");
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
          const newRefreshToken = response.data.refreshToken;
          
          // Use same cookie options as in AuthContext
          const isProduction = process.env.NODE_ENV === "production";
          const cookieOptions = {
            secure: isProduction,
            sameSite: isProduction ? "none" as const : "lax" as const,
          };
          
          setTokenWithFallback("accessToken", newAccessToken, cookieOptions);
          if (newRefreshToken) {
            setTokenWithFallback("refreshToken", newRefreshToken, { ...cookieOptions, expires: 7 });
          }
          
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
  // Use same cookie options for removal as for setting
  const isProduction = process.env.NODE_ENV === "production";
  const cookieOptions = {
    sameSite: isProduction ? "none" as const : "lax" as const,
  };
  
  removeTokenWithFallback("accessToken", cookieOptions);
  removeTokenWithFallback("refreshToken", cookieOptions);
  sessionStorage.clear();
  localStorage.clear();

  window.location.href = "/session-expired";
};

export default api;
