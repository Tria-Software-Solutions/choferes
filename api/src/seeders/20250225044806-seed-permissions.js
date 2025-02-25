"use strict";

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
  },
  down: async (queryInterface) => {
    await queryInterface.bulkDelete("permissions", null, {});
  },
};
