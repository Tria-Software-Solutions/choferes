'use strict';

/** @type {import('sequelize-cli').Migration} */
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // HoursWorked
    await queryInterface.removeConstraint('hours_worked', 'hours_worked_employeeId_fkey');
    await queryInterface.addConstraint('hours_worked', {
      fields: ['employeeId'],
      type: 'foreign key',
      name: 'hours_worked_employeeId_fkey',
      references: {
        table: 'employees',
        field: 'id',
      },
      onDelete: 'CASCADE',
    });

    // WeeklySummary
    await queryInterface.removeConstraint('weekly_summary', 'weekly_summary_employeeId_fkey');
    await queryInterface.addConstraint('weekly_summary', {
      fields: ['employeeId'],
      type: 'foreign key',
      name: 'weekly_summary_employeeId_fkey',
      references: {
        table: 'employees',
        field: 'id',
      },
      onDelete: 'CASCADE',
    });

    // BiweeklySummary
    await queryInterface.removeConstraint('biweekly_summary', 'biweekly_summary_employeeId_fkey');
    await queryInterface.addConstraint('biweekly_summary', {
      fields: ['employeeId'],
      type: 'foreign key',
      name: 'biweekly_summary_employeeId_fkey',
      references: {
        table: 'employees',
        field: 'id',
      },
      onDelete: 'CASCADE',
    });

    // MonthlySummary
    await queryInterface.removeConstraint('monthly_summary', 'monthly_summary_employeeId_fkey');
    await queryInterface.addConstraint('monthly_summary', {
      fields: ['employeeId'],
      type: 'foreign key',
      name: 'monthly_summary_employeeId_fkey',
      references: {
        table: 'employees',
        field: 'id',
      },
      onDelete: 'CASCADE',
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Revert the changes
    await queryInterface.removeConstraint('hours_worked', 'hours_worked_employeeId_fkey');
    await queryInterface.addConstraint('hours_worked', {
      fields: ['employeeId'],
      type: 'foreign key',
      name: 'hours_worked_employeeId_fkey',
      references: {
        table: 'employees',
        field: 'id',
      },
    });

    await queryInterface.removeConstraint('weekly_summary', 'weekly_summary_employeeId_fkey');
    await queryInterface.addConstraint('weekly_summary', {
      fields: ['employeeId'],
      type: 'foreign key',
      name: 'weekly_summary_employeeId_fkey',
      references: {
        table: 'employees',
        field: 'id',
      },
    });

    await queryInterface.removeConstraint('biweekly_summary', 'biweekly_summary_employeeId_fkey');
    await queryInterface.addConstraint('biweekly_summary', {
      fields: ['employeeId'],
      type: 'foreign key',
      name: 'biweekly_summary_employeeId_fkey',
      references: {
        table: 'employees',
        field: 'id',
      },
    });

    await queryInterface.removeConstraint('monthly_summary', 'monthly_summary_employeeId_fkey');
    await queryInterface.addConstraint('monthly_summary', {
      fields: ['employeeId'],
      type: 'foreign key',
      name: 'monthly_summary_employeeId_fkey',
      references: {
        table: 'employees',
        field: 'id',
      },
    });
  },
};


