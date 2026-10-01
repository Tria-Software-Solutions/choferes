import axios from "axios";

import {
  setTokenWithFallback,
  getTokenWithFallback,
  removeTokenWithFallback,
} from "../utils/tokenStorage";
import ROUTES from "../constants/routes.constants";

export const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const requestCache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// How long before the access token expires we proactively refresh it.
// This prevents saves from hitting a 401 mid-edit (the main cause of
// silent data loss when the session dies while entering hours records).
const PROACTIVE_REFRESH_MARGIN_MS = 3 * 60 * 1000;

// Singleton: concurrent 401s / proactive refreshes share a single in-flight request.
let refreshPromise: Promise<{ accessToken: string; refreshToken: string }> | null = null;

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
  timeout: 60000,
  maxRedirects: 5,
  maxContentLength: 50 * 1024 * 1024, // 50MB
});

// Decode the JWT payload (unverified) to read the `exp` claim.
const getTokenExpiry = (token: string): number | null => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return typeof payload?.exp === "number" ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
};

const isTokenExpiringSoon = (token: string): boolean => {
  const exp = getTokenExpiry(token);
  if (!exp) return false;
  return exp - Date.now() < PROACTIVE_REFRESH_MARGIN_MS;
};

// Refresh the access token (and optionally the refresh token) using the
// backend /auth/refresh-token endpoint. Reuses an in-flight refresh so that
// multiple requests triggered at the same time only cause one round-trip.
const refreshAccessToken = async (): Promise<{
  accessToken: string;
  refreshToken: string;
}> => {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    // Tokens live in memory + httpOnly cookies. If the in-memory refresh token
    // survived (same page session) send it in the Authorization header; on a
    // hard reload it's gone and the httpOnly refresh cookie is used instead.
    const refreshToken = getTokenWithFallback("refreshToken");
    const refreshHeaders: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (refreshToken) {
      refreshHeaders.Authorization = `Bearer ${refreshToken}`;
    }

    const response = await axios.post(
      `${API_URL}/api/auth/refresh-token`,
      {},
      {
        // Cover Render free-tier cold starts (30-60s) without hanging forever.
        timeout: 70000,
        withCredentials: true,
        headers: refreshHeaders,
      },
    );

    const newAccessToken = response.data.accessToken;
    const newRefreshToken = response.data.refreshToken;

    setTokenWithFallback("accessToken", newAccessToken);
    if (newRefreshToken) {
      setTokenWithFallback("refreshToken", newRefreshToken);
    }

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  })();

  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
};

api.interceptors.request.use(
  async (config) => {
    const accessToken = getTokenWithFallback("accessToken");

    // Proactively refresh if the access token is about to expire so requests
    // (e.g. saving hours worked) never fail with an unexpected 401.
    if (accessToken && isTokenExpiringSoon(accessToken)) {
      try {
        const refreshed = await refreshAccessToken();
        config.headers["Authorization"] = `Bearer ${refreshed.accessToken}`;
      } catch {
        // Refresh failed — let the request proceed with the old token; the
        // response interceptor will handle a 401 (or fall back to login).
        if (accessToken) {
          config.headers["Authorization"] = `Bearer ${accessToken}`;
        }
      }
    } else if (accessToken) {
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

    // A 401 from the login form means "wrong credentials", not "session over":
    // let the form show the error instead of redirecting to /session-expired.
    const isLoginRequest = String(error.config?.url ?? "").includes("/users/login");

    if (error.response?.status === 401 && !isLoginRequest) {
      // The backend responds with { error: "Unauthorized: Token expired", code: "TOKEN_EXPIRED" }.
      // Match the `code` (and the message as a fallback) so the refresh flow actually runs.
      const data = error.response.data as { code?: string; error?: string } | undefined;
      // MISSING_TOKEN: after a reload the in-memory token is gone and the 1h
      // access cookie may have expired while the 7-day refresh cookie is still
      // valid — try to refresh before ending the session.
      const isTokenExpired =
        data?.code === "TOKEN_EXPIRED" ||
        data?.code === "MISSING_TOKEN" ||
        (typeof data?.error === "string" && data.error.includes("Token expired"));

      const alreadyRetried = Boolean(
        (error.config as { _retry?: boolean } | undefined)?._retry,
      );

      if (isTokenExpired && !alreadyRetried && error.config) {
        try {
          const refreshed = await refreshAccessToken();
          (error.config as { _retry?: boolean })._retry = true;
          error.config.headers["Authorization"] = `Bearer ${refreshed.accessToken}`;
          return api.request(error.config);
        } catch (refreshError) {
          disconnectUser();
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token, not a token-expired error, or refresh already retried → login required.
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

// Ends the server session: the backend expires the httpOnly auth cookies,
// which otherwise stay valid (and keep authenticating requests) after the
// in-memory tokens are dropped. Best effort — a failure must never block the
// local logout.
export const endServerSession = async () => {
  clearApiCache();
  try {
    await axios.post(`${API_URL}/api/auth/logout`, {}, { withCredentials: true, timeout: 10000 });
  } catch {
    // Offline or server asleep: cookies expire on their own.
  }
};

export const invalidateCache = (url: string) => {
  for (const [key] of requestCache) {
    if (key.includes(url)) {
      requestCache.delete(key);
    }
  }
};

const disconnectUser = () => {
  removeTokenWithFallback("accessToken");
  removeTokenWithFallback("refreshToken");
  sessionStorage.clear();
  void endServerSession();
  // NOTE: do NOT clear all of localStorage here. It holds user preferences
  // (themeMode, dock/table preferences, schedule order) that must survive a
  // token refresh failure. Clearing it wiped the saved theme in production.
  window.location.href = ROUTES.SESSION_EXPIRED;
};

export default api;
