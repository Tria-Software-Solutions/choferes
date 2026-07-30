"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("users", "settings", {
      type: Sequelize.JSONB,
      allowNull: true,
      defaultValue: {},
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn("users", "settings");
  },
};
