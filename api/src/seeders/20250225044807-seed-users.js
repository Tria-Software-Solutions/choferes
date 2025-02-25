"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface) => {
    await queryInterface.bulkInsert("users", [
      {
        id: 1,
        firstName: "Luis",
        lastName: "Herrera",
        email: "luis.herrera_506@hotmail.com",
        username: "lmhq94",
        password: "admin123",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        firstName: "Daniela",
        lastName: "Miranda",
        email: "danielamirandamurillo@gmail.com",
        username: "danilumix",
        password: "admin123",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },
  down: async (queryInterface) => {
    await queryInterface.bulkDelete("users", null, {});
  },
};
