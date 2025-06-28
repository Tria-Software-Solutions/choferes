import axios from "axios";
import Cookies from "js-cookie";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

// Cache simple para requests GET
const requestCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
  timeout: 30000, // 30 segundos timeout
  // Configuraciones de performance
  maxRedirects: 5,
  maxContentLength: 50 * 1024 * 1024, // 50MB
});

// Interceptor para cache de requests GET
api.interceptors.request.use(
  (config) => {
    const accessToken = Cookies.get("accessToken");
    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }

    // Cache para requests GET
    if (config.method === 'get' && !config.headers['x-no-cache']) {
      const cacheKey = `${config.url}${JSON.stringify(config.params || {})}`;
      const cached = requestCache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        // Crear una respuesta simulada para datos cacheados
        const cachedResponse = {
          data: cached.data,
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
        };
        
        // Lanzar un error especial que será capturado por el interceptor de respuesta
        const error = new Error('CACHED_RESPONSE');
        (error as any).cachedResponse = cachedResponse;
        throw error;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para guardar respuestas en cache
api.interceptors.response.use(
  (response) => {
    // Guardar en cache solo respuestas GET exitosas
    if (response.config.method === 'get' && response.status === 200) {
      const cacheKey = `${response.config.url}${JSON.stringify(response.config.params || {})}`;
      requestCache.set(cacheKey, {
        data: response.data,
        timestamp: Date.now()
      });
    }
    return response;
  },
  async (error) => {
    // Si es una respuesta cacheados, retornarla
    if (error.message === 'CACHED_RESPONSE' && error.cachedResponse) {
      return error.cachedResponse;
    }

    if (
      error.response?.status === 401 &&
      error.response.data?.error === "Token expired"
    ) {
      try {
        // Hacer request directo para refresh token
        const response = await axios.post(
          `${API_URL}/api/auth/refresh-token`,
          {},
          {
            withCredentials: true,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${Cookies.get("refreshToken")}`
            }
          }
        );
        
        const newAccessToken = response.data.accessToken;
        Cookies.set("accessToken", newAccessToken);
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

// Función para limpiar cache
export const clearApiCache = () => {
  requestCache.clear();
};

// Función para invalidar cache específico
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
  console.warn("Session expired. User disconnected.");
  window.location.href = "/session-expired";
};

export default api;
