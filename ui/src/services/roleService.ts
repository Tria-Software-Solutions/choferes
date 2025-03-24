import { Role } from "../models/Role";
import api from "./api";

export const getRoles = async () => {
  const response = await api.get("/roles");
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
  return response.data;
};

export const updateRole = async (
  id: number,
  updatedRole: Partial<Role>
) => {
  await api.put(`/roles/${id}`, updatedRole);
};

export const deleteRole = async (id: number) => {
  await api.delete(`/roles/${id}`);
};
