"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Remove duplicate rows from weekly_summary keeping the row with the smallest id
    await queryInterface.sequelize.query(`
      DELETE FROM weekly_summary
      WHERE id NOT IN (
        SELECT MIN(id) FROM weekly_summary
        GROUP BY "employeeId", "weekNumber", "year"
      )
    `);

    // Remove duplicate rows from biweekly_summary
    await queryInterface.sequelize.query(`
      DELETE FROM biweekly_summary
      WHERE id NOT IN (
        SELECT MIN(id) FROM biweekly_summary
        GROUP BY "employeeId", "biweekNumber", "year"
      )
    `);

    // Remove duplicate rows from monthly_summary
    await queryInterface.sequelize.query(`
      DELETE FROM monthly_summary
      WHERE id NOT IN (
        SELECT MIN(id) FROM monthly_summary
        GROUP BY "employeeId", "month", "year"
      )
    `);

    // Add unique constraints to prevent future duplicates
    await queryInterface.addConstraint("weekly_summary", {
      fields: ["employeeId", "weekNumber", "year"],
      type: "unique",
      name: "weekly_summary_employeeId_weekNumber_year_key",
    });

    await queryInterface.addConstraint("biweekly_summary", {
      fields: ["employeeId", "biweekNumber", "year"],
      type: "unique",
      name: "biweekly_summary_employeeId_biweekNumber_year_key",
    });

    await queryInterface.addConstraint("monthly_summary", {
      fields: ["employeeId", "month", "year"],
      type: "unique",
      name: "monthly_summary_employeeId_month_year_key",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint(
      "weekly_summary",
      "weekly_summary_employeeId_weekNumber_year_key"
    );
    await queryInterface.removeConstraint(
      "biweekly_summary",
      "biweekly_summary_employeeId_biweekNumber_year_key"
    );
    await queryInterface.removeConstraint(
      "monthly_summary",
      "monthly_summary_employeeId_month_year_key"
    );
  },
};
