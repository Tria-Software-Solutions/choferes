"use strict";

// Supervisor y Usuario aterrizan en "Mi Panel" y ya no ven la página de Roles.
// Se revoca `roles:view` por code (identidad estable); es idempotente.
const ROLES = ["Supervisor", "Usuario"];
const CODE = "roles:view";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(
      `DELETE FROM role_permission
       WHERE "roleId" IN (SELECT id FROM roles WHERE name IN (:roles))
         AND "permissionId" IN (SELECT id FROM permissions WHERE code = :code)`,
      { replacements: { roles: ROLES, code: CODE } },
    );
  },

  async down(queryInterface) {
    const now = new Date();
    await queryInterface.sequelize.query(
      `INSERT INTO role_permission ("roleId", "permissionId", "createdAt", "updatedAt")
       SELECT r.id, p.id, :now, :now
       FROM roles r CROSS JOIN permissions p
       WHERE r.name IN (:roles) AND p.code = :code
         AND NOT EXISTS (
           SELECT 1 FROM role_permission rp
           WHERE rp."roleId" = r.id AND rp."permissionId" = p.id
         )`,
      { replacements: { roles: ROLES, code: CODE, now } },
    );
  },
};
