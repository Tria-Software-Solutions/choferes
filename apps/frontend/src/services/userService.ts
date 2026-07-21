import { User } from "../models/User";
import api, { invalidateCache } from "./api";

// Authenticates a user with username/email and password
export const authenticateUser = async (
  identifier: string,
  password: string,
) => {
  const payload = {
    identifier,
    password,
  };

  try {
    // First login can be slower on cold-started backends, so allow a longer timeout.
    const response = await api.post("/users/login", payload, { timeout: 65000 });
    return response.data;
  } catch (error: unknown) {
    const err = error as { code?: string; response?: { status?: number } };

    // Retry once if the first attempt timed out or hit a transient server error during cold recovery.
    if (err.code === "ECONNABORTED" || err.response?.status === 500) {
      await new Promise((resolve) => {
        setTimeout(resolve, 1500);
      });
      const retryResponse = await api.post("/users/login", payload, { timeout: 65000 });
      return retryResponse.data;
    }

    throw error;
  }
};

// Refreshes the access token using the refresh token (with credentials)
export const refreshAccessToken = async () => {
  try {
    const response = await api.post(
      "/auth/refresh-token",
      {},
      {
        withCredentials: true,
      },
    );

    return response.data;
  } catch (error) {
    throw error;
  }
};

// Fetches all users
export const getUsers = async (search?: string) => {
  const params: Record<string, string | number> = {
    _t: Date.now(), // Add timestamp to bypass cache
  };
  if (search) params.search = search;

  const response = await api.get("/users", { params });
  return response.data.data;
};

// Fetches a user by their ID
export const getUserById = async (id: number) => {
  const response = await api.get(`/users/${id}`);
  return response.data;
};

export const getUserByEmail = async (email: string) => {
  const response = await api.get(`/users/email/${email}`);
  return response.data;
};

export const getUserByUsername = async (username: string) => {
  const response = await api.get(`/users/username/${username}`);
  return response.data;
};

export const getUserPermissions = async (id: number) => {
  const response = await api.get(`/users/${id}/permissions`);
  return response.data;
};

export const createUser = async (newUser: Omit<User, "id">) => {
  const response = await api.post("/users/register", newUser);
  // Clear cache to ensure fresh data
  invalidateCache("/users");
  return response.data;
};

export const updateUser = async (
  id: number,
  updatedUser: Partial<User>,
) => {
  const response = await api.put(`/users/${id}`, updatedUser);
  // Clear cache to ensure fresh data
  invalidateCache("/users");
  return response.data;
};

export const updateUserStatus = async (id: number, status: boolean) => {
  const response = await api.put(`/users/${id}/status`, { isActive: status });
  return response.data;
};

export const updateUserPassword = async (id: number, password: string) => {
  await api.put(`/users/${id}/password`, { password });
};

export const updateUserTemporalPassword = async (
  id: number,
  temporalPassword: string,
) => {
  const response = await api.put(`/users/${id}/temporal-password`, {
    temporalPassword,
  });
  return response.data;
};

export const deleteUser = async (id: number) => {
  const response = await api.delete(`/users/${id}`);
  // Clear cache to ensure fresh data
  invalidateCache("/users");
  return { id, message: response.data };
};
