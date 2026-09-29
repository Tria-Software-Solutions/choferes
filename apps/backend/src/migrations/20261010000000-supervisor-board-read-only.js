"use strict";

/**
 * El Supervisor solo ve Mi Panel, Tareas, Configuración y el tablero de Roles
 * en modo lectura. El tablero ahora carga empleados y horarios con `roles:view`
 * (las rutas de listado lo aceptan), así que se le retiran `employees:view` y
 * `schedules:view`, que abrían las páginas de Empleados y Horarios.
 *
 * @type {import('sequelize-cli').Migration}
 */

const CODES = ["employees:view", "schedules:view"];

module.exports = {
  up: async (queryInterface) => {
    const { sequelize } = queryInterface;
    await sequelize.query(
      `DELETE FROM role_permission
       WHERE "roleId" IN (SELECT id FROM roles WHERE name = 'Supervisor')
         AND "permissionId" IN (SELECT id FROM permissions WHERE code IN (:codes))`,
      { replacements: { codes: CODES } },
    );
  },

  down: async (queryInterface) => {
    const { sequelize } = queryInterface;
    const now = new Date();
    await sequelize.query(
      `INSERT INTO role_permission ("roleId", "permissionId", "createdAt", "updatedAt")
       SELECT r.id, p.id, :now, :now
       FROM roles r CROSS JOIN permissions p
       WHERE r.name = 'Supervisor' AND p.code IN (:codes)
         AND NOT EXISTS (
           SELECT 1 FROM role_permission rp WHERE rp."roleId" = r.id AND rp."permissionId" = p.id
         )`,
      { replacements: { codes: CODES, now } },
    );
  },
};
