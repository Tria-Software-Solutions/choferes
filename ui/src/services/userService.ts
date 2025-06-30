import { User } from "../models/User";
import api from "./api";

export const authenticateUser = async (
  identifier: string,
  password: string,
) => {
  const response = await api.post("/users/login", {
    identifier,
    password,
  });
  return response.data;
};

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

export const getUsers = async () => {
  const response = await api.get("/users");
  return response.data;
};

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

export const createUser = async (
  user: Omit<User, "id" | "temporalPassword">,
) => {
  const response = await api.post("/users/register", user);
  return response.data;
};

export const updateUser = async (id: number, updatedUser: Partial<User>) => {
  await api.put(`/users/${id}`, updatedUser);
};

export const updateUserStatus = async (id: number, status: boolean) => {
  await api.put(`/users/${id}/status`, { isActive: status });
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
  return { id, message: response.data };
};
