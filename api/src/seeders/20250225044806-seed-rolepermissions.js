'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface) => {
    await queryInterface.bulkInsert("role_permission", [
      { roleId: 1, permissionId: 1, createdAt: new Date(), updatedAt: new Date() },
      { roleId: 1, permissionId: 2, createdAt: new Date(), updatedAt: new Date() },
      { roleId: 1, permissionId: 3, createdAt: new Date(), updatedAt: new Date() },
      { roleId: 1, permissionId: 4, createdAt: new Date(), updatedAt: new Date() },
      { roleId: 1, permissionId: 5, createdAt: new Date(), updatedAt: new Date() },
      { roleId: 1, permissionId: 6, createdAt: new Date(), updatedAt: new Date() },
      { roleId: 1, permissionId: 7, createdAt: new Date(), updatedAt: new Date() },
      { roleId: 1, permissionId: 8, createdAt: new Date(), updatedAt: new Date() },
      { roleId: 1, permissionId: 9, createdAt: new Date(), updatedAt: new Date() },
      { roleId: 1, permissionId: 10, createdAt: new Date(), updatedAt: new Date() },
      { roleId: 1, permissionId: 11, createdAt: new Date(), updatedAt: new Date() },
      { roleId: 1, permissionId: 12, createdAt: new Date(), updatedAt: new Date() },
      { roleId: 1, permissionId: 13, createdAt: new Date(), updatedAt: new Date() },
      { roleId: 1, permissionId: 14, createdAt: new Date(), updatedAt: new Date() },
      { roleId: 1, permissionId: 15, createdAt: new Date(), updatedAt: new Date() },
      { roleId: 2, permissionId: 10, createdAt: new Date(), updatedAt: new Date() },
      { roleId: 2, permissionId: 13, createdAt: new Date(), updatedAt: new Date() },
      { roleId: 2, permissionId: 16, createdAt: new Date(), updatedAt: new Date() },
    ]);
  },
  down: async (queryInterface) => {
    await queryInterface.bulkDelete("role_permission", null, {});
  },
};
