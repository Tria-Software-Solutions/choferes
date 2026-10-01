import { UserRole } from "../models/UserRole";
import api, { invalidateCache } from "./api";

export const getUserRoles = async () => {
  const response = await api.get("/user-role", {
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
  const response = await api.post("/user-role", userRole);
  invalidateCache("/user-role");
  return response.data;
};

// Reemplaza los roles del usuario: un solo id o la lista completa.
export const updateUserRole = async (
  userId: number,
  roles: number | number[]
) => {
  const response = await api.put(
    `/user-role/${userId}`,
    Array.isArray(roles) ? { roleIds: roles } : { roleId: roles },
  );
  invalidateCache("/user-role");
  return response.data;
};

export const deleteUserRole = async (id: number) => {
  const response = await api.delete(`/user-role/${id}`);
  invalidateCache("/user-role");
  return { id, message: response.data };
};
