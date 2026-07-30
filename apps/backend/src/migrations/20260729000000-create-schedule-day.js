"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("schedule_day", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      scheduleId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "schedule", key: "id" },
        onDelete: "CASCADE",
      },
      day: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      hours: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("NOW()"),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("NOW()"),
      },
    });

    // Add unique constraint on (scheduleId, day)
    await queryInterface.addConstraint("schedule_day", {
      fields: ["scheduleId", "day"],
      type: "unique",
      name: "schedule_day_scheduleId_day_unique",
    });

    // Backfill: create schedule_day entries for existing schedules
    // Use default hours for each day in the schedule's days array
    const schedules = await queryInterface.sequelize.query(
      `SELECT id, days, hours FROM schedule`,
      { type: queryInterface.sequelize.QueryTypes.SELECT },
    );

    const daysOfWeek = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
    const entries = [];

    for (const schedule of schedules) {
      const selectedDays = schedule.days || [];
      const defaultHours = schedule.hours || 0;

      for (const day of daysOfWeek) {
        if (selectedDays.includes(day)) {
          entries.push({
            scheduleId: schedule.id,
            day,
            hours: defaultHours,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
      }
    }

    if (entries.length > 0) {
      await queryInterface.bulkInsert("schedule_day", entries);
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("schedule_day");
  },
};
