'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('vehicles', 'licensePlate', {
      type: Sequelize.STRING,
      allowNull: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('vehicles', 'licensePlate', {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true, 
    });
  }
};
