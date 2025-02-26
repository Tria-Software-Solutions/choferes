"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface) => {
    await queryInterface.bulkInsert("roles", [
      { id: 1, name: "Admin", createdAt: new Date(), updatedAt: new Date() },
      { id: 2, name: "Coordinator", createdAt: new Date(), updatedAt: new Date() },
      { id: 3, name: "User", createdAt: new Date(), updatedAt: new Date() },
    ]);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete("roles", null, {});
  },
};
