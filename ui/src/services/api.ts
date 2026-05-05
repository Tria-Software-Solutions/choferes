import axios from "axios";
import Cookies from "js-cookie";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

// Helper functions for token storage with localStorage fallback
const setTokenWithFallback = (key: string, value: string, options?: Cookies.CookieAttributes) => {
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

const removeTokenWithFallback = (key: string, options?: Cookies.CookieAttributes) => {
  console.log(`🔍 [DEBUG] removeTokenWithFallback called for key: ${key}`);
  
  try {
    // Check if token exists before removal
    const cookieValue = Cookies.get(key);
    const storageValue = localStorage.getItem(key);
    console.log(`🔍 [DEBUG] Token status before removal:`, {
      cookie: cookieValue ? "exists" : "missing",
      localStorage: storageValue ? "exists" : "missing"
    });
    
    // Try to remove from cookie first
    console.log(`🔍 [DEBUG] Removing from cookies with options:`, options);
    Cookies.remove(key, options);
    
    // Also remove from localStorage
    console.log(`🔍 [DEBUG] Removing from localStorage`);
    localStorage.removeItem(key);
    
    // Verify removal
    const cookieAfter = Cookies.get(key);
    const storageAfter = localStorage.getItem(key);
    console.log(`🔍 [DEBUG] Token status after removal:`, {
      cookie: cookieAfter ? "still_exists" : "removed",
      localStorage: storageAfter ? "still_exists" : "removed"
    });
    
  } catch (error) {
    console.log(`🔍 [DEBUG] Cookie removal failed, using localStorage only. Error:`, error);
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
      console.log("🔍 [DEBUG] 401 Error detected:", {
        url: error.config?.url,
        errorData: error.response?.data,
        hasRefreshToken: !!getTokenWithFallback("refreshToken"),
        errorMessage: error.response?.data?.error
      });
      
      // Try to refresh token first
      const refreshToken = getTokenWithFallback("refreshToken");
      if (refreshToken && error.response.data?.error === "Token expired") {
        console.log("🔍 [DEBUG] Attempting token refresh...");
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
            path: "/",
          };
          
          setTokenWithFallback("accessToken", newAccessToken, cookieOptions);
          if (newRefreshToken) {
            setTokenWithFallback("refreshToken", newRefreshToken, { ...cookieOptions, expires: 7 });
          }
          
          error.config.headers["Authorization"] = `Bearer ${newAccessToken}`;
          return api.request(error.config);
        } catch (refreshError) {
          console.log("🔍 [DEBUG] Token refresh failed:", refreshError);
          console.log("🔍 [DEBUG] Calling disconnectUser due to refresh failure");
          disconnectUser();
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token or not a token expired error, redirect to login
        console.log("🔍 [DEBUG] No refresh token or not expired error, calling disconnectUser");
        console.log("🔍 [DEBUG] Refresh token exists:", !!refreshToken);
        console.log("🔍 [DEBUG] Error message:", error.response?.data?.error);
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
  console.log("🔍 [DEBUG] disconnectUser called");
  
  // Use same cookie options for removal as for setting
  const isProduction = process.env.NODE_ENV === "production";
  const cookieOptions = {
    sameSite: isProduction ? "none" as const : "lax" as const,
  };
  
  console.log("🔍 [DEBUG] Environment:", { isProduction, cookieOptions });
  
  // Check tokens before removal
  const accessTokenBefore = getTokenWithFallback("accessToken");
  const refreshTokenBefore = getTokenWithFallback("refreshToken");
  console.log("🔍 [DEBUG] Tokens before removal:", { 
    accessToken: accessTokenBefore ? "exists" : "missing",
    refreshToken: refreshTokenBefore ? "exists" : "missing"
  });
  
  console.log("🔍 [DEBUG] Removing access token...");
  removeTokenWithFallback("accessToken", cookieOptions);
  
  console.log("🔍 [DEBUG] Removing refresh token...");
  removeTokenWithFallback("refreshToken", cookieOptions);
  
  console.log("🔍 [DEBUG] Clearing sessionStorage...");
  sessionStorage.clear();
  
  console.log("🔍 [DEBUG] Clearing localStorage...");
  localStorage.clear();
  
  // Verify tokens after removal
  const accessTokenAfter = getTokenWithFallback("accessToken");
  const refreshTokenAfter = getTokenWithFallback("refreshToken");
  console.log("🔍 [DEBUG] Tokens after removal:", { 
    accessToken: accessTokenAfter ? "still_exists" : "removed",
    refreshToken: refreshTokenAfter ? "still_exists" : "removed"
  });
  
  console.log("🔍 [DEBUG] Redirecting to /session-expired");
  console.log("🔍 [DEBUG] Current URL:", window.location.href);
  console.log("🔍 [DEBUG] User agent:", navigator.userAgent);
  
  window.location.href = "/session-expired";
};

export default api;
