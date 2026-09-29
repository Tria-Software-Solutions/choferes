"use strict";

/**
 * Añade permisos de edición de usuarios y roles al rol Administrativo,
 * para que pueda gestionar la sección "Administración" de Configuración.
 *
 * Antes: Administrativo solo tenía permisos de lectura (:view, :export).
 * Ahora: también puede editar usuarios (incluye generar contraseña temporal)
 *        y editar roles.
 */

const ADMIN_EDIT_CODES = [
  "users:edit",   // editar usuario, cambiar contraseña, generar temporal
  "roles:edit",   // editar permisos de roles
];

module.exports = {
  async up(queryInterface) {
    const { sequelize } = queryInterface;
    const now = new Date();

    await sequelize.transaction(async (transaction) => {
      // Añade los permisos de edición al rol Administrativo
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

  async down(queryInterface) {
    const { sequelize } = queryInterface;

    await sequelize.transaction(async (transaction) => {
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
};
