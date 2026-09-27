"use strict";

/**
 * Link an employee (Planilla) to a user account (Auth).
 *
 * A user may have 0 or 1 employee profile. An employee may have 0 or 1 user
 * account (the person who logs in). The link is optional on both sides:
 * - Admins who never clock in have no employee profile.
 * - Employees without system access have no user account.
 * The "Activar acceso al sistema" button in the employee detail creates/links
 * the user account and sends the invitation/reset email.
 *
 * @type {import('sequelize-cli').Migration}
 */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (transaction) => {
      // 1) Columna en users (nullable, única) — la FK está en el lado de
      //    identidad porque el usuario es la entidad de login; el empleado
      //    es la entidad de planilla. Al borrar empleado se pone NULL.
      await queryInterface.addColumn(
        "users",
        "employeeId",
        {
          type: Sequelize.INTEGER,
          allowNull: true,
          unique: true,
          references: { model: "employees", key: "id" },
          onDelete: "SET NULL",
          onUpdate: "CASCADE",
        },
        { transaction },
      );

      // 2) Índice ya lo crea `unique: true`, pero por claridad:
      await queryInterface.addIndex("users", ["employeeId"], {
        unique: true,
        name: "users_employeeId_unique",
        transaction,
      });
    });
  },

  down: async (queryInterface) => {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeIndex("users", "users_employeeId_unique", { transaction });
      await queryInterface.removeColumn("users", "employeeId", { transaction });
    });
  },
};