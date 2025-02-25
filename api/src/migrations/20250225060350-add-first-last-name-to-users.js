'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('users', 'firstName', {
      type: Sequelize.STRING,
      allowNull: false,
    });
    
    await queryInterface.addColumn('users', 'lastName', {
      type: Sequelize.STRING,
      allowNull: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('users', 'firstName');
    await queryInterface.removeColumn('users', 'lastName');
  }
};
