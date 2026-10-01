"use strict";

/**
 * Un empleado puede tener más de un puesto (y por lo tanto más de un rol).
 *
 *   - `employees.positions` (varchar[]) guarda todos los puestos; es obligatoria
 *     y tiene al menos uno.
 *   - `employees.position` se conserva como el puesto principal (el primero de
 *     `positions`) para el código que solo conoce uno.
 *
 * @type {import('sequelize-cli').Migration}
 */
module.exports = {
  up: async (queryInterface) => {
    const { sequelize } = queryInterface;
    await sequelize.transaction(async (transaction) => {
      await sequelize.query(
        "ALTER TABLE employees ADD COLUMN IF NOT EXISTS positions varchar(100)[]",
        { transaction },
      );
      await sequelize.query(
        `UPDATE employees SET positions = ARRAY[position]
         WHERE positions IS NULL OR cardinality(positions) = 0`,
        { transaction },
      );
      await sequelize.query("ALTER TABLE employees ALTER COLUMN positions SET NOT NULL", {
        transaction,
      });
      await sequelize.query(
        `ALTER TABLE employees
         ADD CONSTRAINT employees_positions_not_empty CHECK (cardinality(positions) >= 1)`,
        { transaction },
      );
    });
  },

  down: async (queryInterface) => {
    const { sequelize } = queryInterface;
    await sequelize.query(
      "ALTER TABLE employees DROP CONSTRAINT IF EXISTS employees_positions_not_empty",
    );
    await sequelize.query("ALTER TABLE employees DROP COLUMN IF EXISTS positions");
  },
};
