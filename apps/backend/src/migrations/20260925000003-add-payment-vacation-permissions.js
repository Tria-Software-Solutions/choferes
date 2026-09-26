"use strict";

// Permisos de Pagos (44-48) y Vacaciones (49-52).
// Gerencia (id=1): todos. Administrativo (id=2): ver/crear/editar/enviar
// (sin eliminar). En BD fresca el seeder asigna los permisos porque los roles
// todavía no existen al correr la migración.
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface) => {
    const now = new Date();

    const permissions = [
      { id: 44, name: "Ver Pagos", createdAt: now, updatedAt: now },
      { id: 45, name: "Crear Pago", createdAt: now, updatedAt: now },
      { id: 46, name: "Editar Pago", createdAt: now, updatedAt: now },
      { id: 47, name: "Eliminar Pago", createdAt: now, updatedAt: now },
      { id: 48, name: "Enviar Pago por Correo", createdAt: now, updatedAt: now },
      { id: 49, name: "Ver Vacaciones", createdAt: now, updatedAt: now },
      { id: 50, name: "Crear Vacación", createdAt: now, updatedAt: now },
      { id: 51, name: "Editar Vacación", createdAt: now, updatedAt: now },
      { id: 52, name: "Eliminar Vacación", createdAt: now, updatedAt: now },
    ];

    const existing = (
      await queryInterface.sequelize.query("SELECT id FROM permissions", {
        type: queryInterface.sequelize.QueryTypes.SELECT,
      })
    ).map((p) => p.id);
    const toInsert = permissions.filter((p) => !existing.includes(p.id));
    if (toInsert.length > 0) {
      await queryInterface.bulkInsert("permissions", toInsert);
    }

    const roles = await queryInterface.sequelize.query("SELECT id FROM roles", {
      type: queryInterface.sequelize.QueryTypes.SELECT,
    });
    const roleIds = roles.map((r) => r.id);

    const rolePermissions = [];
    if (roleIds.includes(1)) {
      [44, 45, 46, 47, 48, 49, 50, 51, 52].forEach((permissionId) => {
        rolePermissions.push({
          roleId: 1,
          permissionId,
          createdAt: now,
          updatedAt: now,
        });
      });
    }
    if (roleIds.includes(2)) {
      [44, 45, 46, 48, 49, 50, 51].forEach((permissionId) => {
        rolePermissions.push({
          roleId: 2,
          permissionId,
          createdAt: now,
          updatedAt: now,
        });
      });
    }

    if (rolePermissions.length > 0) {
      const existingPairs = new Set(
        (
          await queryInterface.sequelize.query(
            'SELECT "roleId", "permissionId" FROM role_permission',
            { type: queryInterface.sequelize.QueryTypes.SELECT },
          )
        ).map((rp) => `${rp.roleId}:${rp.permissionId}`),
      );
      const pairsToInsert = rolePermissions.filter(
        (rp) => !existingPairs.has(`${rp.roleId}:${rp.permissionId}`),
      );
      if (pairsToInsert.length > 0) {
        await queryInterface.bulkInsert("role_permission", pairsToInsert);
      }
    }
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete("role_permission", {
      permissionId: [44, 45, 46, 47, 48, 49, 50, 51, 52],
    });
    await queryInterface.bulkDelete("permissions", {
      id: [44, 45, 46, 47, 48, 49, 50, 51, 52],
    });
  },
};
