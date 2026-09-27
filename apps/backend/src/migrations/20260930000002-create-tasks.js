"use strict";

/**
 * Personal to-do lists (page "Tareas"): each user owns their lists and tasks.
 *
 * tasks.remindAt is an absolute instant (timestamptz). The reminder job turns
 * due reminders into in-app notifications and stamps reminderSentAt, so each
 * reminder fires exactly once (moving remindAt clears the stamp).
 *
 * @type {import('sequelize-cli').Migration}
 */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.createTable(
        "task_lists",
        {
          id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
          userId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: { model: "users", key: "id" },
            onDelete: "CASCADE",
          },
          name: { type: Sequelize.STRING(80), allowNull: false },
          color: { type: Sequelize.STRING(20), allowNull: false, defaultValue: "indigo" },
          position: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
          createdAt: { type: Sequelize.DATE, allowNull: false },
          updatedAt: { type: Sequelize.DATE, allowNull: false },
        },
        { transaction },
      );
      await queryInterface.addIndex("task_lists", ["userId"], { transaction });

      await queryInterface.createTable(
        "tasks",
        {
          id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
          userId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: { model: "users", key: "id" },
            onDelete: "CASCADE",
          },
          listId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: { model: "task_lists", key: "id" },
            onDelete: "CASCADE",
          },
          title: { type: Sequelize.STRING(500), allowNull: false },
          notes: { type: Sequelize.TEXT, allowNull: true },
          dueDate: { type: Sequelize.DATEONLY, allowNull: true },
          dueTime: { type: Sequelize.STRING(5), allowNull: true },
          remindAt: { type: Sequelize.DATE, allowNull: true },
          reminderSentAt: { type: Sequelize.DATE, allowNull: true },
          priority: { type: Sequelize.SMALLINT, allowNull: false, defaultValue: 0 },
          isImportant: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
          recurrence: { type: Sequelize.STRING(20), allowNull: false, defaultValue: "none" },
          subtasks: { type: Sequelize.JSONB, allowNull: false, defaultValue: [] },
          position: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
          completedAt: { type: Sequelize.DATE, allowNull: true },
          createdAt: { type: Sequelize.DATE, allowNull: false },
          updatedAt: { type: Sequelize.DATE, allowNull: false },
        },
        { transaction },
      );
      await queryInterface.addIndex("tasks", ["userId"], { transaction });
      await queryInterface.addIndex("tasks", ["listId"], { transaction });
      // The reminder job scans pending reminders only.
      await queryInterface.sequelize.query(
        `CREATE INDEX "tasks_pending_reminders" ON tasks ("remindAt")
         WHERE "reminderSentAt" IS NULL AND "completedAt" IS NULL AND "remindAt" IS NOT NULL`,
        { transaction },
      );
    });
  },

  down: async (queryInterface) => {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.dropTable("tasks", { transaction });
      await queryInterface.dropTable("task_lists", { transaction });
    });
  },
};
