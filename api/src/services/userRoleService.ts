import { Role } from "../models/Role";
import { UserRole } from "../models/UserRole";

export const getUserRoles = async () => {
  return UserRole.findAll();
};

export const getUserRoleByUserId = async (userId: number) => {
  return await UserRole.findOne({
    where: {
      userId: userId,
    },
  });
};

export const createUserRole = async (data: Omit<UserRole, "id">) => {
  const newUserRole = await UserRole.create(data);
  await newUserRole.reload();
  return newUserRole;
};

// export const updateUserRole = async (userId: number, newRoleId: number) => {
//   await UserRole.update(
//     { roleId: newRoleId },
//     {
//       where: { userId },
//     }
//   );

//   return UserRole.findOne({ where: { userId } });
// };

export const updateUserRole = async (userId: number, newRoleId: number) => {
  const role = await Role.findByPk(newRoleId);
  if (!role) {
    throw new Error("Role not found");
  }

  const updated = await UserRole.update(
    { roleId: newRoleId },
    { where: { userId } } 
  );

  if (updated[0] > 0) {
    return UserRole.findOne({ where: { userId } });
  } else {
    throw new Error("Failed to update UserRole");
  }
};

export const deleteUserRole = async (id: number) => {
  return UserRole.destroy({ where: { id } });
};
