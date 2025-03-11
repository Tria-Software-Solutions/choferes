import { UserRole } from "../models/UserRole";
import api from "./api";

export const getUserRoles = async () => {
  const response = await api.get("/user-role");
  return response.data;
};

export const getUserRoleByUserId = async (userId: number) => {
  const response = await api.get(`/user-role/${userId}`);
  return response.data;
};

export const createUserRole = async (userRole: Omit<UserRole, "id">) => {
  const response = await api.post("/user-role", userRole);
  return response.data;
};

export const updateUserRole = async (
  id: number,
  updatedUserRole: Partial<UserRole>
) => {
  await api.put(`/user-role/${id}`, updatedUserRole);
};

export const deleteUserRole = async (id: number) => {
  await api.delete(`/user-role/${id}`);
};
