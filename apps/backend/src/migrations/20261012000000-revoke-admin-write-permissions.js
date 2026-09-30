"use strict";

/**
 * Revoca los permisos de escritura de usuarios y roles al rol Administrativo,
 * devolviéndolo a su diseño original: Igual que Gerencia pero solo lectura
 * (ver y exportar), con escritura únicamente en sus cosas personales
 * (perfil, notificaciones, tareas propias y solicitar vacaciones).
 *
 * Esto compensa 20261011000000-admin-edit-permissions.js, que concedió
 * `users:edit` y `roles:edit` a Administrativo y fue aplicado en local y prod.
 *
 * Antes: Administrativo podía editar usuarios y roles.
 * Ahora: esos permisos quedan exclusivos de Gerencia y SysAdmin.
 */

const ADMIN_EDIT_CODES = [
  "users:edit", // editar usuario, cambiar contraseña, generar temporal
  "roles:edit", // editar permisos de roles
];

module.exports = {
  async up(queryInterface) {
    const { sequelize } = queryInterface;

    await sequelize.transaction(async (transaction) => {
      // Verifica que el rol Administrativo exista antes de modificar (fail loud)
      const [{ roleCount }] = await sequelize.query(
        `SELECT COUNT(*)::int AS "roleCount" FROM roles WHERE name = 'Administrativo'`,
        { transaction, type: sequelize.QueryTypes.SELECT },
      );
      if (Number(roleCount) === 0) {
        throw new Error("Rol 'Administrativo' no encontrado. Configuración incorrecta.");
      }

      // Revoca los permisos de edición al rol Administrativo
      for (const code of ADMIN_EDIT_CODES) {
        await sequelize.query(
          `DELETE FROM role_permission
           WHERE "roleId" IN (SELECT id FROM roles WHERE name = 'Administrativo')
             AND "permissionId" IN (SELECT id FROM permissions WHERE code = :code)`,
          { replacements: { code }, transaction },
        );
      }
    });
  },

  async down(queryInterface) {
    const { sequelize } = queryInterface;
    const now = new Date();

    await sequelize.transaction(async (transaction) => {
      // Re-añade los permisos de edición al rol Administrativo
      for (const code of ADMIN_EDIT_CODES) {
        await sequelize.query(
          `INSERT INTO role_permission ("roleId", "permissionId", "createdAt", "updatedAt")
           SELECT r.id, p.id, :now, :now
           FROM roles r CROSS JOIN permissions p
           WHERE r.name = 'Administrativo' AND p.code = :code
             AND NOT EXISTS (
               SELECT 1 FROM role_permission rp
               WHERE rp."roleId" = r.id AND rp."permissionId" = p.id
             )`,
          { replacements: { code, now }, transaction },
        );
      }
    });
  },
};