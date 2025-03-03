import { UserRole } from "../models/UserRole";
import api from "./api";

export const getUserRoles = async (userId: number) => {
  const response = await api.get(`/user-role/${userId}`);
  return response.data;
};

export const createUserRole = async (userRole: Omit<UserRole, "id">) => {
  const response = await api.post("/user-role/assign", userRole);
  return response.data;
};

export const deleteUserRole = async (userId: number, roleId: number) => {
  await api.delete("/user-role/remove", {
    data: { userId, roleId },
  });
};
