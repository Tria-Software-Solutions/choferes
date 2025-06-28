'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('vehicles', 'parkingDate', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.fn('NOW')
    });

    await queryInterface.addIndex('vehicles', ['parkingDate'], {
      name: 'idx_vehicles_parkingDate'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('vehicles', 'idx_vehicles_parkingDate');
    await queryInterface.removeColumn('vehicles', 'parkingDate');
  }
}; 