"use strict";

/**
 * Removes the Mensajería / Courier module permissions (the module was dropped
 * from the app). Role assignments go first so no role_permission row points at
 * a deleted permission. Matched by `code`, the stable identity.
 *
 * `down` restores the permissions and grants them back to Gerencia only (the
 * original per-role assignments are not recoverable and no longer matter).
 *
 * @type {import('sequelize-cli').Migration}
 */

// [code, module, label]
const REMOVED = [
  ["messaging:view", "Mensajería", "Ver Mensajería"],
  ["courier:view", "Courier", "Ver Courier"],
  ["courier:create", "Courier", "Crear Courier"],
  ["courier:edit", "Courier", "Editar Courier"],
  ["courier:delete", "Courier", "Eliminar Courier"],
];

const CODES = REMOVED.map(([code]) => code);

module.exports = {
  up: async (queryInterface) => {
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

  down: async (queryInterface) => {
    const { sequelize } = queryInterface;
    const SELECT = sequelize.QueryTypes.SELECT;
    const now = new Date();

    await sequelize.transaction(async (transaction) => {
      await sequelize.query(
        `SELECT setval(
           pg_get_serial_sequence('permissions', 'id'),
           COALESCE((SELECT MAX(id) FROM permissions), 0) + 1,
           false
         )`,
        { transaction },
      );

      /* eslint-disable no-await-in-loop, no-restricted-syntax */
      for (const [code, moduleName, label] of REMOVED) {
        const existing = await sequelize.query("SELECT id FROM permissions WHERE code = :code", {
          replacements: { code },
          type: SELECT,
          transaction,
        });
        if (existing.length === 0) {
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
         WHERE r.name = 'Gerencia' AND p.code IN (:codes)
           AND NOT EXISTS (
             SELECT 1 FROM role_permission rp
             WHERE rp."roleId" = r.id AND rp."permissionId" = p.id
           )`,
        { replacements: { codes: CODES, now }, transaction },
      );
    });
  },
};
