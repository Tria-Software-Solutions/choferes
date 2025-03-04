"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      DO $$
      BEGIN
        -- Si la restricción existe, elimínala
        IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_role_userId_fkey') THEN
          ALTER TABLE "user_role" DROP CONSTRAINT "user_role_userId_fkey";
        END IF;
        IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_role_roleId_fkey') THEN
          ALTER TABLE "user_role" DROP CONSTRAINT "user_role_roleId_fkey";
        END IF;
      END $$;
    `);

    await queryInterface.addConstraint("user_role", {
      fields: ["userId"],
      type: "foreign key",
      name: "user_role_userId_fkey",
      references: {
        table: "users",
        field: "id",
      },
      onDelete: "CASCADE",
    });

    await queryInterface.addConstraint("user_role", {
      fields: ["roleId"],
      type: "foreign key",
      name: "user_role_roleId_fkey",
      references: {
        table: "roles",
        field: "id",
      },
      onDelete: "CASCADE",
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint("user_role", "user_role_userId_fkey");
    await queryInterface.removeConstraint("user_role", "user_role_roleId_fkey");
  },
};
