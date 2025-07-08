import { Role } from "../models/Role";
import api, { invalidateCache } from "./api";

export const getRoles = async () => {
  const response = await api.get("/roles", {
    params: {
      _t: Date.now()
    }
  });
  return response.data;
};

export const getRoleById = async (id: number) => {
  const response = await api.get(`/roles/${id}`);
  return response.data;
};

export const getRoleByName = async (name: string) => {
  const response = await api.get(`/roles/name/${name}`);
  return response.data;
};

export const createRole = async (newRole: Omit<Role, "id">) => {
  const response = await api.post("/roles", newRole);
  invalidateCache("/roles");
  return response.data;
};

export const updateRole = async (id: number, updatedRole: Partial<Role>) => {
  const response = await api.put(`/roles/${id}`, updatedRole);
  invalidateCache("/roles");
  return response.data;
};

export const deleteRole = async (id: number) => {
  const response = await api.delete(`/roles/${id}`);
  invalidateCache("/roles");
  return { id, message: response.data };
};
