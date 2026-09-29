"use strict";

/**
 * Renombra el rol genérico "Usuario" a "SysAdmin" (rol especial con acceso
 * total) y elimina el concepto de rol genérico: toda cuenta debe tener un rol y
 * todo empleado un puesto.
 *
 *   1. asegura que existan los roles "Chofer" y "SysAdmin"
 *   2. mueve a "Chofer" las cuentas que hoy tienen "Usuario"
 *   3. renombra "Usuario" -> "SysAdmin" y le da el catálogo completo
 *   4. rellena con "chofer" los empleados sin puesto
 *   5. asigna "Chofer" a las cuentas que quedaron sin ningún rol
 *   6. hace obligatorio employees.position
 *
 * El catálogo se reutiliza tal como quedó en la migración anterior
 * (20261008000000-refactor-permission-catalog); acá sólo se copian los códigos.
 *
 * @type {import('sequelize-cli').Migration}
 */

const SELECT = (sequelize) => sequelize.QueryTypes.SELECT;

module.exports = {
  up: async (queryInterface) => {
    const { sequelize } = queryInterface;
    const now = new Date();

    const roleIdByName = async (name, transaction) => {
      const rows = await sequelize.query("SELECT id FROM roles WHERE name = :name LIMIT 1", {
        replacements: { name },
        type: SELECT(sequelize),
        transaction,
      });
      return rows.length > 0 ? rows[0].id : null;
    };

    const ensureRole = async (name, transaction) => {
      const existing = await roleIdByName(name, transaction);
      if (existing !== null) return existing;
      const inserted = await sequelize.query(
        `INSERT INTO roles (name, "createdAt", "updatedAt")
         VALUES (:name, :now, :now) RETURNING id`,
        { replacements: { name, now }, type: SELECT(sequelize), transaction },
      );
      return inserted[0].id;
    };

    await sequelize.transaction(async (transaction) => {
      const choferId = await ensureRole("Chofer", transaction);

      // 1-2. Las cuentas con el rol genérico pasan a "Chofer".
      const usuarioId = await roleIdByName("Usuario", transaction);
      if (usuarioId !== null) {
        // Si la cuenta ya tiene Chofer, se descarta la fila duplicada.
        await sequelize.query(
          `DELETE FROM user_role a
           USING user_role b
           WHERE a."userId" = b."userId"
             AND a."roleId" = :usuarioId
             AND b."roleId" = :choferId`,
          { replacements: { usuarioId, choferId }, transaction },
        );
        await sequelize.query(
          `UPDATE user_role SET "roleId" = :choferId, "updatedAt" = :now
           WHERE "roleId" = :usuarioId`,
          { replacements: { choferId, usuarioId, now }, transaction },
        );
      }

      // 3. Renombra el rol genérico. Si "SysAdmin" ya existe (p. ej. lo creó la
      // migración anterior o el seeder), "Usuario" sobra: sus cuentas ya pasaron
      // a "Chofer" en el paso 2, así que se elimina junto con sus permisos.
      let sysAdminId = await roleIdByName("SysAdmin", transaction);
      if (usuarioId !== null && sysAdminId === null) {
        await sequelize.query(
          `UPDATE roles SET name = 'SysAdmin', "updatedAt" = :now WHERE id = :usuarioId`,
          { replacements: { usuarioId, now }, transaction },
        );
        sysAdminId = usuarioId;
      } else if (usuarioId !== null) {
        await sequelize.query(`DELETE FROM role_permission WHERE "roleId" = :usuarioId`, {
          replacements: { usuarioId },
          transaction,
        });
        await sequelize.query(`DELETE FROM roles WHERE id = :usuarioId`, {
          replacements: { usuarioId },
          transaction,
        });
      }
      if (sysAdminId === null) sysAdminId = await ensureRole("SysAdmin", transaction);

      // 3b. SysAdmin = catálogo completo, menos "Mi Panel": esa es la vista
      // personal del empleado y los roles de gestión no la tienen.
      const permissionIds = (
        await sequelize.query("SELECT id FROM permissions WHERE code <> 'my-panel:view'", {
          type: SELECT(sequelize),
          transaction,
        })
      ).map((p) => p.id);
      for (const permissionId of permissionIds) {
        await sequelize.query(
          `INSERT INTO role_permission ("roleId", "permissionId", "createdAt", "updatedAt")
           SELECT :sysAdminId, :permissionId, :now, :now
           WHERE NOT EXISTS (
             SELECT 1 FROM role_permission
             WHERE "roleId" = :sysAdminId AND "permissionId" = :permissionId
           )`,
          { replacements: { sysAdminId, permissionId, now }, transaction },
        );
      }

      // 4. Todo empleado tiene un puesto (los que no, pasan a "chofer").
      await sequelize.query(
        `UPDATE employees SET position = 'chofer', "updatedAt" = :now
         WHERE position IS NULL OR position = ''`,
        { replacements: { now }, transaction },
      );

      // 5. Toda cuenta tiene al menos un rol.
      await sequelize.query(
        `INSERT INTO user_role ("userId", "roleId", "createdAt", "updatedAt")
         SELECT u.id, :choferId, :now, :now
         FROM users u
         WHERE NOT EXISTS (SELECT 1 FROM user_role ur WHERE ur."userId" = u.id)`,
        { replacements: { choferId, now }, transaction },
      );

      // 6. El puesto pasa a ser obligatorio.
      await sequelize.query("ALTER TABLE employees ALTER COLUMN position SET NOT NULL", {
        transaction,
      });
    });
  },

  down: async (queryInterface) => {
    const { sequelize } = queryInterface;
    const now = new Date();

    await sequelize.transaction(async (transaction) => {
      await sequelize.query("ALTER TABLE employees ALTER COLUMN position DROP NOT NULL", {
        transaction,
      });

      const sysAdminId = (
        await sequelize.query("SELECT id FROM roles WHERE name = 'SysAdmin' LIMIT 1", {
          type: SELECT(sequelize),
          transaction,
        })
      )[0]?.id;
      if (sysAdminId !== undefined) {
        await sequelize.query(
          `UPDATE roles SET name = 'Usuario', "updatedAt" = :now WHERE id = :sysAdminId`,
          { replacements: { now, sysAdminId }, transaction },
        );
      }
    });
  },
};
