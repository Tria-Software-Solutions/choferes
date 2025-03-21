import { User } from "../models/User";
import api from "./api";

export const authenticateUser = async (username: string, password: string) => {
  const response = await api.post("/users/login", {
    username,
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
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error refreshing token:", error);
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

export const getUserByUsername = async (username: string) => {
  const response = await api.get(`/users/username/${username}`);
  return response.data;
};

export const getUserPermissions = async (id: number) => {
  const response = await api.get(`/users/${id}/permissions`);
  return response.data;
};

export const createUser = async (user: Omit<User, "id" | "role">) => {
  const response = await api.post("/users/register", user);
  return response.data;
};

export const updateUser = async (
  id: number,
  updatedUser: Partial<User>
) => {
  await api.put(`/users/${id}`, updatedUser);
};

export const deleteUser = async (id: number) => {
  await api.delete(`/users/${id}`);
};
