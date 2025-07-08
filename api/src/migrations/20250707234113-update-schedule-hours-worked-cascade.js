'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Drop the existing foreign key constraint
    await queryInterface.removeConstraint('hours_worked', 'hours_worked_scheduleId_fkey');
    
    // Add the new foreign key constraint with CASCADE delete
    await queryInterface.addConstraint('hours_worked', {
      fields: ['scheduleId'],
      type: 'foreign key',
      name: 'hours_worked_scheduleId_fkey',
      references: {
        table: 'schedule',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
  },

  async down(queryInterface, Sequelize) {
    // Drop the CASCADE constraint
    await queryInterface.removeConstraint('hours_worked', 'hours_worked_scheduleId_fkey');
    
    // Add back the original constraint without CASCADE
    await queryInterface.addConstraint('hours_worked', {
      fields: ['scheduleId'],
      type: 'foreign key',
      name: 'hours_worked_scheduleId_fkey',
      references: {
        table: 'schedule',
        field: 'id'
      },
      onUpdate: 'CASCADE'
    });
  }
};
