"use strict";

/**
 * Permisos del módulo Tareas (listas de pendientes personales con
 * recordatorios). Sin estas filas nadie —ni Gerencia— podía abrir la página en
 * una base existente, porque el catálogo compartido ya los exige.
 *
 * Cada usuario solo ve sus propias tareas, así que los cuatro permisos se
 * otorgan a todos los roles sembrados. Se insertan por `code` (idempotente,
 * igual en BD fresca y existente) y se asignan a los roles por nombre.
 *
 * @type {import('sequelize-cli').Migration}
 */

// [code, module, label]
const CATALOG = [
  ["tasks:view", "Tareas", "Ver Tareas"],
  ["tasks:create", "Tareas", "Crear Tarea"],
  ["tasks:edit", "Tareas", "Editar Tarea"],
  ["tasks:delete", "Tareas", "Eliminar Tarea"],
];

const CODES = CATALOG.map(([code]) => code);
const ROLES = ["Gerencia", "Administrativo", "Supervisor", "Usuario"];

module.exports = {
  up: async (queryInterface) => {
    const { sequelize } = queryInterface;
    const SELECT = sequelize.QueryTypes.SELECT;
    const now = new Date();

    await sequelize.transaction(async (transaction) => {
      // Legacy rows used explicit ids: advance the sequence before inserting.
      await sequelize.query(
        `SELECT setval(
           pg_get_serial_sequence('permissions', 'id'),
           COALESCE((SELECT MAX(id) FROM permissions), 0) + 1,
           false
         )`,
        { transaction },
      );

      /* eslint-disable no-await-in-loop, no-restricted-syntax */
      for (const [code, moduleName, label] of CATALOG) {
        const existing = await sequelize.query("SELECT id FROM permissions WHERE code = :code", {
          replacements: { code },
          type: SELECT,
          transaction,
        });
        if (existing.length > 0) {
          await sequelize.query(
            `UPDATE permissions SET name = :label, module = :moduleName, "updatedAt" = :now
             WHERE code = :code`,
            { replacements: { label, moduleName, now, code }, transaction },
          );
        } else {
          await queryInterface.bulkInsert(
            "permissions",
            [{ code, module: moduleName, name: label, createdAt: now, updatedAt: now }],
            { transaction },
          );
        }
      }
      /* eslint-enable no-await-in-loop, no-restricted-syntax */

      await sequelize.query(
        `INSERT INTO role_permission ("roleId", "permissionId", "createdAt", "updatedAt")
         SELECT r.id, p.id, :now, :now
         FROM roles r CROSS JOIN permissions p
         WHERE r.name IN (:roles) AND p.code IN (:codes)
           AND NOT EXISTS (
             SELECT 1 FROM role_permission rp
             WHERE rp."roleId" = r.id AND rp."permissionId" = p.id
           )`,
        { replacements: { roles: ROLES, codes: CODES, now }, transaction },
      );
    });
  },

  down: async (queryInterface) => {
    const { sequelize } = queryInterface;
    await sequelize.transaction(async (transaction) => {
      await sequelize.query(
        `DELETE FROM role_permission
         WHERE "permissionId" IN (SELECT id FROM permissions WHERE code IN (:codes))`,
        { replacements: { codes: CODES }, transaction },
      );
      await sequelize.query("DELETE FROM permissions WHERE code IN (:codes)", {
        replacements: { codes: CODES },
        transaction,
      });
    });
  },
};
