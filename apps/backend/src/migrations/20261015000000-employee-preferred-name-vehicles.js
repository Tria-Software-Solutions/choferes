"use strict";

/**
 * Agrega:
 *   - preferredName varchar(100): apodo o nombre preferido del empleado
 *   - vehicles JSONB [{ plate, type }]: reemplaza vehiclePlates con tipo de vehículo
 *
 * Si la columna vehiclePlates ya existe (de la migración 20261014), migra los
 * datos a vehicles con type = 'car'. Si no existe, vehicles empieza vacío.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tableDesc = await queryInterface.describeTable("employees");

    if (!tableDesc.preferredName) {
      await queryInterface.addColumn("employees", "preferredName", {
        type: Sequelize.STRING(100),
        allowNull: true,
      });
    }

    if (!tableDesc.vehicles) {
      await queryInterface.addColumn("employees", "vehicles", {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: [],
      });

      // Backfill desde vehiclePlates si existe la columna
      if (tableDesc.vehiclePlates) {
        await queryInterface.sequelize.query(`
          UPDATE employees
          SET vehicles = (
            SELECT COALESCE(
              json_agg(json_build_object('plate', p, 'type', 'car')),
              '[]'::json
            )
            FROM unnest("vehiclePlates") AS p
            WHERE p IS NOT NULL
          )::jsonb
          WHERE cardinality("vehiclePlates") > 0
        `);
      }
    }
  },

  async down(queryInterface) {
    const tableDesc = await queryInterface.describeTable("employees");
    if (tableDesc.vehicles) {
      await queryInterface.removeColumn("employees", "vehicles");
    }
    if (tableDesc.preferredName) {
      await queryInterface.removeColumn("employees", "preferredName");
    }
  },
};
