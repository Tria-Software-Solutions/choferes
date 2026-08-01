"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface) => {
    const now = new Date();

    await queryInterface.bulkInsert("permissions", [
      {
        id: 31,
        name: "Ver Usuarios",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 32,
        name: "Ver Resumen Semanal",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 33,
        name: "Ver Resumen Quincenal",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 34,
        name: "Ver Resumen Mensual",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 35,
        name: "Editar Resumen Semanal",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 36,
        name: "Editar Resumen Quincenal",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 37,
        name: "Editar Resumen Mensual",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 38,
        name: "Reordenar Horarios",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 39,
        name: "Ver Courier",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 40,
        name: "Crear Courier",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 41,
        name: "Editar Courier",
        createdAt: now,
        updatedAt: now,
      },
    ]);

    // Assign all new permissions to Gerencia role (id=1)
    // Solo si los roles ya existen (BD migrada con seed previo); en BD fresca
    // el seed se encarga de las asignaciones completas.
    const roles = await queryInterface.sequelize.query("SELECT id FROM roles", {
      type: queryInterface.sequelize.QueryTypes.SELECT,
    });
    const roleIds = roles.map((r) => r.id);
    if (roleIds.includes(1)) {
      await queryInterface.bulkInsert("role_permission", [
        { roleId: 1, permissionId: 31, createdAt: now, updatedAt: now },
        { roleId: 1, permissionId: 32, createdAt: now, updatedAt: now },
        { roleId: 1, permissionId: 33, createdAt: now, updatedAt: now },
        { roleId: 1, permissionId: 34, createdAt: now, updatedAt: now },
        { roleId: 1, permissionId: 35, createdAt: now, updatedAt: now },
        { roleId: 1, permissionId: 36, createdAt: now, updatedAt: now },
        { roleId: 1, permissionId: 37, createdAt: now, updatedAt: now },
        { roleId: 1, permissionId: 38, createdAt: now, updatedAt: now },
        { roleId: 1, permissionId: 39, createdAt: now, updatedAt: now },
        { roleId: 1, permissionId: 40, createdAt: now, updatedAt: now },
        { roleId: 1, permissionId: 41, createdAt: now, updatedAt: now },
      ]);
    }
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete("role_permission", {
      permissionId: [31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41],
    });
    await queryInterface.bulkDelete("permissions", {
      id: [31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41],
    });
  },
};
