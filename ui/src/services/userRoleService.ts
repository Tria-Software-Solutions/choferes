import api from "./api";

export const assignUserRole = async (userId: number, roleId: number) => {
  const response = await api.post("/user-role/assign", {
    userId,
    roleId,
  });
  return response.data;
};

export const fetchUserRoles = async (userId: number) => {
  const response = await api.get(`/user-role/${userId}`);
  return response.data;
};

export const deleteUserRole = async (userId: number, roleId: number) => {
  const response = await api.delete("/user-role/remove", {
    data: { userId, roleId },
  });
  return response.data;
};
