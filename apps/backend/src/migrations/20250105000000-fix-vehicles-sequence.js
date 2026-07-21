"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Fix the sequence for vehicles table
    await queryInterface.sequelize.query(`
      SELECT setval(
        pg_get_serial_sequence('vehicles', 'id'),
        COALESCE((SELECT MAX(id) FROM vehicles), 0) + 1,
        false
      );
    `);
  },

  down: async (queryInterface, Sequelize) => {
    // No down migration needed for this fix
  },
}; 