"use strict";
const bcrypt = require("bcrypt");

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
  },
  down: async (queryInterface) => {
    await queryInterface.bulkDelete("users", null, {});
  },
};
