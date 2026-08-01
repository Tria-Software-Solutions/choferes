"use strict";

// Reconstruida (2026-07-31): el archivo original se perdió; se dedujo del
// esquema final de la BD y de los modelos (schedule.days, sin columna day).
// Idempotente: segura aunque el SequelizeMeta de la BD ya contenga (o no)
// la entrada y las columnas ya existan (p. ej. BD de producción).

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(
      'ALTER TABLE schedule ADD COLUMN IF NOT EXISTS days character varying(255)[]',
    );
    const [dayCol] = await queryInterface.sequelize.query(
      `SELECT 1 FROM information_schema.columns
       WHERE table_name = 'schedule' AND column_name = 'day'`,
    );
    if (dayCol.length > 0) {
      await queryInterface.sequelize.query(
        `UPDATE schedule SET days = CASE
           WHEN day = 'weekday' THEN ARRAY['monday','tuesday','wednesday','thursday','friday']::character varying(255)[]
           ELSE ARRAY[day]::character varying(255)[]
         END
         WHERE days IS NULL`,
      );
    }
    await queryInterface.sequelize.query(
      'ALTER TABLE schedule ALTER COLUMN days SET NOT NULL',
    );
    await queryInterface.sequelize.query(
      'ALTER TABLE schedule DROP COLUMN IF EXISTS day',
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn("schedule", "day", {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "weekday",
    });
    await queryInterface.sequelize.query(
      'ALTER TABLE schedule DROP COLUMN IF EXISTS days',
    );
  },
};
