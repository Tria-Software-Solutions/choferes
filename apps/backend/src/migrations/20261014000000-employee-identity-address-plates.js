"use strict";

/**
 * Datos personales del empleado:
 *   - birthDate        fecha de nacimiento
 *   - address          dirección de residencia
 *   - vehiclePlates    placas de sus vehículos propios (restricción vehicular)
 *   - nationalIdType   cedula | dimex | pasaporte | otro (los extranjeros tienen
 *                      documentos más largos y con letras)
 *   - nationality      ISO 3166-1 alfa-2; de aquí sale la bandera
 *
 * `nationalId` pasa a poder guardar letras (pasaportes), por lo que su columna
 * deja de ser sólo numérica en la práctica; no cambia de tipo.
 *
 * @type {import('sequelize-cli').Migration}
 */
module.exports = {
  up: async (queryInterface) => {
    const { sequelize } = queryInterface;
    await sequelize.transaction(async (transaction) => {
      await sequelize.query(
        `ALTER TABLE employees
           ADD COLUMN IF NOT EXISTS "birthDate" date,
           ADD COLUMN IF NOT EXISTS address text,
           ADD COLUMN IF NOT EXISTS "vehiclePlates" varchar(10)[] NOT NULL DEFAULT '{}',
           ADD COLUMN IF NOT EXISTS "nationalIdType" varchar(20) NOT NULL DEFAULT 'cedula',
           ADD COLUMN IF NOT EXISTS nationality varchar(2) NOT NULL DEFAULT 'CR'`,
        { transaction },
      );
      await sequelize.query(
        `ALTER TABLE employees
           ADD CONSTRAINT employees_national_id_type_check
           CHECK ("nationalIdType" IN ('cedula', 'dimex', 'pasaporte', 'otro'))`,
        { transaction },
      );
      // Un documento ya guardado con letras no puede ser una cédula: se marca como
      // "otro" para que la regla de la cédula no lo rechace al editarlo.
      await sequelize.query(
        `UPDATE employees SET "nationalIdType" = 'otro'
         WHERE "nationalId" IS NOT NULL AND "nationalId" !~ '^[0-9]+$'`,
        { transaction },
      );
    });
  },

  down: async (queryInterface) => {
    const { sequelize } = queryInterface;
    await sequelize.query(
      "ALTER TABLE employees DROP CONSTRAINT IF EXISTS employees_national_id_type_check",
    );
    await sequelize.query(
      `ALTER TABLE employees
         DROP COLUMN IF EXISTS "birthDate",
         DROP COLUMN IF EXISTS address,
         DROP COLUMN IF EXISTS "vehiclePlates",
         DROP COLUMN IF EXISTS "nationalIdType",
         DROP COLUMN IF EXISTS nationality`,
    );
  },
};
