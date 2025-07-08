import { UserRole } from "../models/UserRole";
import api, { invalidateCache } from "./api";

export const getUserRoles = async () => {
  const response = await api.get("/user-roles", {
    params: {
      _t: Date.now()
    }
  });
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
  const response = await api.post("/user-roles", userRole);
  invalidateCache("/user-roles");
  return response.data;
};

export const updateUserRole = async (
  userId: number,
  roleId: number
) => {
  const response = await api.put(`/user-role/${userId}`, { roleId });
  invalidateCache("/user-roles");
  return response.data;
};

export const deleteUserRole = async (id: number) => {
  const response = await api.delete(`/user-roles/${id}`);
  invalidateCache("/user-roles");
  return { id, message: response.data };
};
