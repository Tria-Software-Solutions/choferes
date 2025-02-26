"use strict";
const bcrypt = require("bcrypt");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface) => {
    await queryInterface.bulkInsert("permissions", [
      {
        id: 1,
        name: "view_users",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        name: "edit_users",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 3,
        name: "delete_users",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 4,
        name: "view_roles",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 5,
        name: "edit_roles",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 6,
        name: "delete_roles",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 7,
        name: "view_permissions",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 8,
        name: "edit_permissions",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 9,
        name: "delete_permissions",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 10,
        name: "view_employees",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 11,
        name: "edit_employees",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 12,
        name: "delete_employees",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 13,
        name: "view_schedules",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 14,
        name: "edit_schedules",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 15,
        name: "delete_schedules",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 16,
        name: "view_hours",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 17,
        name: "edit_hours",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 18,
        name: "delete_hours",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    await queryInterface.bulkInsert("roles", [
      { id: 1, name: "Admin", createdAt: new Date(), updatedAt: new Date() },
      {
        id: 2,
        name: "Coordinator",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      { id: 3, name: "User", createdAt: new Date(), updatedAt: new Date() },
    ]);
    await queryInterface.bulkInsert("role_permission", [
      {
        roleId: 1,
        permissionId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        roleId: 1,
        permissionId: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        roleId: 1,
        permissionId: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        roleId: 1,
        permissionId: 4,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        roleId: 1,
        permissionId: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        roleId: 1,
        permissionId: 6,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        roleId: 1,
        permissionId: 7,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        roleId: 1,
        permissionId: 8,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        roleId: 1,
        permissionId: 9,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        roleId: 1,
        permissionId: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        roleId: 1,
        permissionId: 11,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        roleId: 1,
        permissionId: 12,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        roleId: 1,
        permissionId: 13,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        roleId: 1,
        permissionId: 14,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        roleId: 1,
        permissionId: 15,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        roleId: 2,
        permissionId: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        roleId: 2,
        permissionId: 13,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        roleId: 2,
        permissionId: 16,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    await queryInterface.bulkInsert("users", [
      {
        id: 1,
        firstName: "Luis",
        lastName: "Herrera",
        email: "luis.herrera_506@hotmail.com",
        username: "lmhq94",
        password: await bcrypt.hash("Admin123$", 10),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        firstName: "Daniela",
        lastName: "Miranda",
        email: "danielamirandamurillo@gmail.com",
        username: "danilumix",
        password: await bcrypt.hash("Admin123$", 10),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    await queryInterface.bulkInsert("user_role", [
      { userId: 1, roleId: 1, createdAt: new Date(), updatedAt: new Date() },
      { userId: 2, roleId: 1, createdAt: new Date(), updatedAt: new Date() },
    ]);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete("user_role", null, {});
    await queryInterface.bulkDelete("role_permission", null, {});
    await queryInterface.bulkDelete("users", null, {});
    await queryInterface.bulkDelete("roles", null, {});
    await queryInterface.bulkDelete("permissions", null, {});
  },
};
