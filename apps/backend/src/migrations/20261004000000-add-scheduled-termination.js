"use strict";

/** Adds scheduled (future) termination fields to the employees table. */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("employees", "scheduledTerminationDate", {
      type: Sequelize.DATEONLY,
      allowNull: true,
      defaultValue: null,
    });
    await queryInterface.addColumn("employees", "scheduledTerminationReason", {
      type: Sequelize.STRING(30),
      allowNull: true,
      defaultValue: null,
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn("employees", "scheduledTerminationDate");
    await queryInterface.removeColumn("employees", "scheduledTerminationReason");
  },
};
