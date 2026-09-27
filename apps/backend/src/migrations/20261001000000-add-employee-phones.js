"use strict";

/**
 * Contact phones on the employee record ("Planilla").
 *
 * Both columns store digits only: the CR mask (`####-####`) is applied in the
 * UI, so the database stays sortable and searchable. `nationalId` is migrated
 * to digits-only for the same reason — records typed before the mask existed
 * can still carry dashes, so they are normalized here as well.
 *
 * @type {import('sequelize-cli').Migration}
 */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        "employees",
        "primaryPhone",
        { type: Sequelize.STRING(20), allowNull: true },
        { transaction },
      );
      await queryInterface.addColumn(
        "employees",
        "secondaryPhone",
        { type: Sequelize.STRING(20), allowNull: true },
        { transaction },
      );

      // Cédulas typed with the old hint ("Ej: 1-2345-6789") may carry dashes
      // or spaces; keep only the digits so every row has the same shape.
      await queryInterface.sequelize.query(
        `UPDATE "employees"
            SET "nationalId" = regexp_replace("nationalId", '[^0-9]', '', 'g')
          WHERE "nationalId" IS NOT NULL
            AND "nationalId" ~ '[^0-9]'`,
        { transaction },
      );
    });
  },

  down: async (queryInterface) => {
    await queryInterface.sequelize.transaction(async (transaction) => {
      // Dashes cannot be recovered, so `down` only drops the phone columns.
      await queryInterface.removeColumn("employees", "secondaryPhone", { transaction });
      await queryInterface.removeColumn("employees", "primaryPhone", { transaction });
    });
  },
};
