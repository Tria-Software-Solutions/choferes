'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('user', 'firstName', {
      type: Sequelize.STRING,
      allowNull: false,
    });
    
    await queryInterface.addColumn('user', 'lastName', {
      type: Sequelize.STRING,
      allowNull: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('user', 'firstName');
    await queryInterface.removeColumn('user', 'lastName');
  }
};
