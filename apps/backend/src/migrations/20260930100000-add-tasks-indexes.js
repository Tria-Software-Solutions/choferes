"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.transaction(async (t) => {
      // tasks: tareas pendientes de un usuario ordenadas por fecha de vencimiento
      await queryInterface.sequelize.query(
        `CREATE INDEX IF NOT EXISTS idx_tasks_user_due
         ON tasks ("userId", "dueDate")
         WHERE "completedAt" IS NULL`,
        { transaction: t },
      );

      // tasks: tareas completadas de un usuario (historial)
      await queryInterface.sequelize.query(
        `CREATE INDEX IF NOT EXISTS idx_tasks_user_completed
         ON tasks ("userId", "completedAt")
         WHERE "completedAt" IS NOT NULL`,
        { transaction: t },
      );
    });
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`DROP INDEX IF EXISTS idx_tasks_user_due`);
    await queryInterface.sequelize.query(`DROP INDEX IF EXISTS idx_tasks_user_completed`);
  },
};
