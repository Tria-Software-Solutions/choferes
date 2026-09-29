"use strict";

/**
 * Permiso del panel personal ("Mi Panel").
 *
 * El panel muestra únicamente la información del empleado vinculado al usuario
 * autenticado (horario, vacaciones, amonestaciones, licencias, horas, pagos y
 * tareas), así que su acceso se controla con un permiso explícito para que cada
 * organización decida quién lo ve desde Administración de Roles.
 *
 * Se otorga a Supervisor y Usuario (los roles operativos), que son los que hoy
 * no tienen acceso al panel de reportes (`admin:view`).
 *
 * Se inserta por `code` (identidad estable), nunca por id ni por label, para
 * que sea idempotente en una BD fresca (el seeder ya sembró el catálogo) y en
 * una existente.
 *
 * @type {import('sequelize-cli').Migration}
 */

const CODE = "dashboard:self:view";
const MODULE = "Admin";
const LABEL = "Ver Mi Panel";
const ROLES = ["Supervisor", "Usuario"];

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

      const existing = await sequelize.query("SELECT id FROM permissions WHERE code = :code", {
        replacements: { code: CODE },
        type: SELECT,
        transaction,
      });

      if (existing.length > 0) {
        await sequelize.query(
          `UPDATE permissions SET name = :label, module = :moduleName, "updatedAt" = :now
           WHERE code = :code`,
          { replacements: { label: LABEL, moduleName: MODULE, now, code: CODE }, transaction },
        );
      } else {
        await queryInterface.bulkInsert(
          "permissions",
          [{ code: CODE, module: MODULE, name: LABEL, createdAt: now, updatedAt: now }],
          { transaction },
        );
      }

      await sequelize.query(
        `INSERT INTO role_permission ("roleId", "permissionId", "createdAt", "updatedAt")
         SELECT r.id, p.id, :now, :now
         FROM roles r CROSS JOIN permissions p
         WHERE r.name IN (:roles) AND p.code = :code
           AND NOT EXISTS (
             SELECT 1 FROM role_permission rp
             WHERE rp."roleId" = r.id AND rp."permissionId" = p.id
           )`,
        { replacements: { roles: ROLES, code: CODE, now }, transaction },
      );
    });
  },

  down: async (queryInterface) => {
    const { sequelize } = queryInterface;
    await sequelize.transaction(async (transaction) => {
      await sequelize.query(
        `DELETE FROM role_permission
         WHERE "permissionId" IN (SELECT id FROM permissions WHERE code = :code)`,
        { replacements: { code: CODE }, transaction },
      );
      await sequelize.query("DELETE FROM permissions WHERE code = :code", {
        replacements: { code: CODE },
        transaction,
      });
    });
  },
};
