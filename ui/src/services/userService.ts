import api from "./api";

export const registerUser = async (
  firstName: string,
  lastName: string,
  email: string,
  username: string,
  password: string,
  roleId: number
) => {
  const response = await api.post("/users/register", {
    firstName,
    lastName,
    email,
    username,
    password,
    roleId,
  });
  return response.data;
};

export const loginUser = async (username: string, password: string) => {
  const response = await api.post("/users/login", {
    username,
    password,
  });
  return response.data;
};

export const fetchUsers = async () => {
  const response = await api.get("/users");
  return response.data;
};

export const getUserById = async (id: number) => {
  const response = await api.get(`/users/${id}`);
  return response.data;
};
