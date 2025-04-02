import { UserRole } from "../models/UserRole";
import api from "./api";

export const getUserRoles = async () => {
  const response = await api.get("/user-role");
  return response.data;
};

export const getUserRoleByUserId = async (userId: number) => {
  const response = await api.get(`/user-role/userId/${userId}`);
  return response.data;
};

export const getUserRoleByRoleId = async (roleId: number) => {
  const response = await api.get(`/user-role/roleId/${roleId}`);
  return response.data;
};

export const createUserRole = async (userRole: Omit<UserRole, "id">) => {
  const response = await api.post("/user-role", userRole);
  return response.data;
};

export const updateUserRole = async (userId: number, roleId: number) => {
  const response = await api.put(`/user-role/${userId}`, { roleId });
  return response.data;
};

export const deleteUserRole = async (id: number) => {
  const response = await api.delete(`/user-role/${id}`);
  return { id, message: response.data };
};
