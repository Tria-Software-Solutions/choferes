"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface) => {
    const now = new Date();

    await queryInterface.bulkInsert("permissions", [
      {
        id: 42,
        name: "Eliminar Courier",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 43,
        name: "Crear Usuario",
        createdAt: now,
        updatedAt: now,
      },
    ]);

    // Assign to Gerencia role (id=1) solo si los roles ya existen (BD con
    // seed previo); en BD fresca el seed cubre las asignaciones.
    const roles = await queryInterface.sequelize.query("SELECT id FROM roles", {
      type: queryInterface.sequelize.QueryTypes.SELECT,
    });
    if (roles.some((r) => r.id === 1)) {
      await queryInterface.bulkInsert("role_permission", [
        { roleId: 1, permissionId: 42, createdAt: now, updatedAt: now },
        { roleId: 1, permissionId: 43, createdAt: now, updatedAt: now },
      ]);
    }
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete("role_permission", {
      permissionId: [42, 43],
    });
    await queryInterface.bulkDelete("permissions", {
      id: [42, 43],
    });
  },
};
