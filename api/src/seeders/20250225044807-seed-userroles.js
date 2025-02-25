"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface) => {
    await queryInterface.bulkInsert("user_role", [
      { userId: 1, roleId: 1, createdAt: new Date(), updatedAt: new Date() },
      { userId: 2, roleId: 1, createdAt: new Date(), updatedAt: new Date() },
    ]);
  },
  down: async (queryInterface) => {
    await queryInterface.bulkDelete("user_role", null, {});
  },
};
