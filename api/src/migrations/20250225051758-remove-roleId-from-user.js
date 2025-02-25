'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('user', 'roleId');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('user', 'roleId', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
  },
};
