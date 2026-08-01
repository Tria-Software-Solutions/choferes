"use strict";
const bcrypt = require("bcrypt");

const SEED_PASSWORDS = {
  ADMIN: process.env.SEED_ADMIN_PASSWORD || "Admin123$",
  MANAGEMENT: process.env.SEED_MANAGEMENT_PASSWORD || "Gerencia123$",
  CUSTOMER_SERVICE: process.env.SEED_CUSTOMER_SERVICE_PASSWORD || "678900CS$",
};

if (process.env.NODE_ENV === "production") {
  const required = {
    SEED_ADMIN_PASSWORD: SEED_PASSWORDS.ADMIN,
    SEED_MANAGEMENT_PASSWORD: SEED_PASSWORDS.MANAGEMENT,
    SEED_CUSTOMER_SERVICE_PASSWORD: SEED_PASSWORDS.CUSTOMER_SERVICE,
  };
  for (const [name, value] of Object.entries(required)) {
    if (!process.env[name] || value.length < 12) {
      throw new Error(
        `[seeder] ${name} es obligatoria en producción (min 12 chars). Evita las contraseñas por defecto.`
      );
    }
  }
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface) => {
    await queryInterface.bulkInsert("schedule", [
      {
        id: 1,
        label: "Avenida Escazú",
        hours: 12,
        days: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        label: "Hospital CIMA",
        hours: 11,
        days: ["monday", "tuesday", "wednesday", "thursday", "friday"],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 3,
        label: "BAC Latam",
        hours: 11,
        days: ["monday", "tuesday", "wednesday", "thursday", "friday"],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 5,
        label: "Clínica Bíblica",
        hours: 10,
        days: ["monday", "tuesday", "wednesday", "thursday", "friday"],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 6,
        label: "Salida Programada",
        hours: 9,
        days: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 7,
        label: "Cubre Almuerzo BAC",
        hours: 5,
        days: ["monday", "tuesday", "wednesday", "thursday"],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 8,
        label: "Libre",
        hours: 0,
        days: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 9,
        label: "Ausencia",
        hours: 0,
        days: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 11,
        label: "Plaza Tempo",
        hours: 12,
        days: ["friday", "saturday", "sunday"],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 17,
        label: "Cubre Almuerzo Promerica",
        hours: 4,
        days: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 21,
        label: "Lincoln Plaza",
        hours: 12,
        days: ["friday", "saturday", "sunday"],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 22,
        label: "Terrazas Lindora",
        hours: 12,
        days: ["friday", "saturday", "sunday"],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 24,
        label: "Incapacidad",
        hours: 0,
        days: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 27,
        label: "Cubre Almuerzo",
        hours: 4,
        days: ["saturday", "sunday"],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 44,
        label: "Horario Especial",
        hours: 8,
        days: ["sunday"],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 55,
        label: "Evento Especial",
        hours: 4,
        days: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    await queryInterface.bulkInsert("schedule_day", [
      { scheduleId: 1, day: "monday", hours: 12, createdAt: new Date(), updatedAt: new Date() },
      { scheduleId: 1, day: "tuesday", hours: 12, createdAt: new Date(), updatedAt: new Date() },
      { scheduleId: 1, day: "wednesday", hours: 12, createdAt: new Date(), updatedAt: new Date() },
      { scheduleId: 1, day: "thursday", hours: 12, createdAt: new Date(), updatedAt: new Date() },
      { scheduleId: 1, day: "friday", hours: 12, createdAt: new Date(), updatedAt: new Date() },
      { scheduleId: 1, day: "saturday", hours: 12, createdAt: new Date(), updatedAt: new Date() },
      { scheduleId: 1, day: "sunday", hours: 9, createdAt: new Date(), updatedAt: new Date() },
      { scheduleId: 2, day: "monday", hours: 11, createdAt: new Date(), updatedAt: new Date() },
      { scheduleId: 2, day: "tuesday", hours: 11, createdAt: new Date(), updatedAt: new Date() },
      { scheduleId: 2, day: "wednesday", hours: 11, createdAt: new Date(), updatedAt: new Date() },
      { scheduleId: 2, day: "thursday", hours: 11, createdAt: new Date(), updatedAt: new Date() },
      { scheduleId: 2, day: "friday", hours: 11, createdAt: new Date(), updatedAt: new Date() },
      { scheduleId: 3, day: "monday", hours: 11, createdAt: new Date(), updatedAt: new Date() },
      { scheduleId: 3, day: "tuesday", hours: 11, createdAt: new Date(), updatedAt: new Date() },
      { scheduleId: 3, day: "wednesday", hours: 11, createdAt: new Date(), updatedAt: new Date() },
      { scheduleId: 3, day: "thursday", hours: 11, createdAt: new Date(), updatedAt: new Date() },
      { scheduleId: 3, day: "friday", hours: 11, createdAt: new Date(), updatedAt: new Date() },
      { scheduleId: 5, day: "monday", hours: 10, createdAt: new Date(), updatedAt: new Date() },
      { scheduleId: 5, day: "tuesday", hours: 10, createdAt: new Date(), updatedAt: new Date() },
      { scheduleId: 5, day: "wednesday", hours: 10, createdAt: new Date(), updatedAt: new Date() },
      { scheduleId: 5, day: "thursday", hours: 10, createdAt: new Date(), updatedAt: new Date() },
      { scheduleId: 5, day: "friday", hours: 10, createdAt: new Date(), updatedAt: new Date() },
      { scheduleId: 6, day: "monday", hours: 9, createdAt: new Date(), updatedAt: new Date() },
      { scheduleId: 6, day: "tuesday", hours: 9, createdAt: new Date(), updatedAt: new Date() },
      { scheduleId: 6, day: "wednesday", hours: 9, createdAt: new Date(), updatedAt: new Date() },
      { scheduleId: 6, day: "thursday", hours: 9, createdAt: new Date(), updatedAt: new Date() },
      { scheduleId: 6, day: "friday", hours: 9, createdAt: new Date(), updatedAt: new Date() },
      { scheduleId: 6, day: "saturday", hours: 9, createdAt: new Date(), updatedAt: new Date() },
      { scheduleId: 6, day: "sunday", hours: 9, createdAt: new Date(), updatedAt: new Date() },
      { scheduleId: 7, day: "monday", hours: 5, createdAt: new Date(), updatedAt: new Date() },
      { scheduleId: 7, day: "tuesday", hours: 5, createdAt: new Date(), updatedAt: new Date() },
      { scheduleId: 7, day: "wednesday", hours: 5, createdAt: new Date(), updatedAt: new Date() },
      { scheduleId: 7, day: "thursday", hours: 5, createdAt: new Date(), updatedAt: new Date() },
      { scheduleId: 8, day: "monday", hours: 0, createdAt: new Date(), updatedAt: new Date() },
      { scheduleId: 8, day: "tuesday", hours: 0, createdAt: new Date(), updatedAt: new Date() },
      { scheduleId: 8, day: "wednesday", hours: 0, createdAt: new Date(), updatedAt: new Date() },
      { scheduleId: 8, day: "thursday", hours: 0, createdAt: new Date(), updatedAt: new Date() },
      { scheduleId: 8, day: "friday", hours: 0, createdAt: new Date(), updatedAt: new Date() },
      { scheduleId: 8, day: "saturday", hours: 0, createdAt: new Date(), updatedAt: new Date() },
      { scheduleId: 8, day: "sunday", hours: 0, createdAt: new Date(), updatedAt: new Date() },
      { scheduleId: 9, day: "monday", hours: 0, createdAt: new Date(), updatedAt: new Date() },
      { scheduleId: 9, day: "tuesday", hours: 0, createdAt: new Date(), updatedAt: new Date() },
      { scheduleId: 9, day: "wednesday", hours: 0, createdAt: new Date(), updatedAt: new Date() },
      { scheduleId: 9, day: "thursday", hours: 0, createdAt: new Date(), updatedAt: new Date() },
      { scheduleId: 9, day: "friday", hours: 0, createdAt: new Date(), updatedAt: new Date() },
      { scheduleId: 9, day: "saturday", hours: 0, createdAt: new Date(), updatedAt: new Date() },
      { scheduleId: 9, day: "sunday", hours: 0, createdAt: new Date(), updatedAt: new Date() },
      { scheduleId: 11, day: "friday", hours: 12, createdAt: new Date(), updatedAt: new Date() },
      { scheduleId: 11, day: "saturday", hours: 12, createdAt: new Date(), updatedAt: new Date() },
      { scheduleId: 11, day: "sunday", hours: 9, createdAt: new Date(), updatedAt: new Date() },
      { scheduleId: 17, day: "monday", hours: 4, createdAt: new Date(), updatedAt: new Date() },
      { scheduleId: 17, day: "tuesday", hours: 4, createdAt: new Date(), updatedAt: new Date() },
      { scheduleId: 17, day: "wednesday", hours: 4, createdAt: new Date(), updatedAt: new Date() },
      { scheduleId: 17, day: "thursday", hours: 4, createdAt: new Date(), updatedAt: new Date() },
      { scheduleId: 17, day: "friday", hours: 4, createdAt: new Date(), updatedAt: new Date() },
      { scheduleId: 17, day: "saturday", hours: 4, createdAt: new Date(), updatedAt: new Date() },
      { scheduleId: 17, day: "sunday", hours: 4, createdAt: new Date(), updatedAt: new Date() },
      { scheduleId: 21, day: "friday", hours: 12, createdAt: new Date(), updatedAt: new Date() },
      { scheduleId: 21, day: "saturday", hours: 12, createdAt: new Date(), updatedAt: new Date() },
      { scheduleId: 21, day: "sunday", hours: 9, createdAt: new Date(), updatedAt: new Date() },
      { scheduleId: 22, day: "friday", hours: 12, createdAt: new Date(), updatedAt: new Date() },
      { scheduleId: 22, day: "saturday", hours: 12, createdAt: new Date(), updatedAt: new Date() },
      { scheduleId: 22, day: "sunday", hours: 11, createdAt: new Date(), updatedAt: new Date() },
      { scheduleId: 24, day: "monday", hours: 0, createdAt: new Date(), updatedAt: new Date() },
      { scheduleId: 24, day: "tuesday", hours: 0, createdAt: new Date(), updatedAt: new Date() },
      { scheduleId: 24, day: "wednesday", hours: 0, createdAt: new Date(), updatedAt: new Date() },
      { scheduleId: 24, day: "thursday", hours: 0, createdAt: new Date(), updatedAt: new Date() },
      { scheduleId: 24, day: "friday", hours: 0, createdAt: new Date(), updatedAt: new Date() },
      { scheduleId: 24, day: "saturday", hours: 0, createdAt: new Date(), updatedAt: new Date() },
      { scheduleId: 24, day: "sunday", hours: 0, createdAt: new Date(), updatedAt: new Date() },
      { scheduleId: 27, day: "saturday", hours: 4, createdAt: new Date(), updatedAt: new Date() },
      { scheduleId: 27, day: "sunday", hours: 4, createdAt: new Date(), updatedAt: new Date() },
      { scheduleId: 44, day: "sunday", hours: 8, createdAt: new Date(), updatedAt: new Date() },
      { scheduleId: 55, day: "monday", hours: 4, createdAt: new Date(), updatedAt: new Date() },
      { scheduleId: 55, day: "tuesday", hours: 4, createdAt: new Date(), updatedAt: new Date() },
      { scheduleId: 55, day: "wednesday", hours: 4, createdAt: new Date(), updatedAt: new Date() },
      { scheduleId: 55, day: "thursday", hours: 4, createdAt: new Date(), updatedAt: new Date() },
      { scheduleId: 55, day: "friday", hours: 4, createdAt: new Date(), updatedAt: new Date() },
      { scheduleId: 55, day: "saturday", hours: 4, createdAt: new Date(), updatedAt: new Date() },
      { scheduleId: 55, day: "sunday", hours: 4, createdAt: new Date(), updatedAt: new Date() },
    ]);
    const existingPermissionIds = (
      await queryInterface.sequelize.query("SELECT id FROM permissions", {
        type: queryInterface.sequelize.QueryTypes.SELECT,
      })
    ).map((p) => p.id);

    const permissions = [
      {
        id: 1,
        name: "Ver Roles",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        name: "Ver Horas de Empleados",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 3,
        name: "Editar Roles de Empleados",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 4,
        name: "Exportar Excel de Roles de Empleados",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 5,
        name: "Exportar PDF de Roles de Empleados",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 6,
        name: "Ver Empleados",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 7,
        name: "Crear Empleado",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 8,
        name: "Editar Empleado",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 9,
        name: "Eliminar Empleado",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 10,
        name: "Exportar Excel de Empleados",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 11,
        name: "Exportar PDF de Empleados",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 12,
        name: "Ver Horarios",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 13,
        name: "Crear Horario",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 14,
        name: "Editar Horario",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 15,
        name: "Eliminar Horario",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 16,
        name: "Exportar Excel de Horarios",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 17,
        name: "Exportar PDF de Horarios",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 18,
        name: "Ver Vehículos",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 19,
        name: "Crear Vehículo",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 20,
        name: "Editar Vehículo",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 21,
        name: "Eliminar Vehículo",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 22,
        name: "Exportar Excel de Vehículos",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 23,
        name: "Exportar PDF de Vehículos",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 24,
        name: "Ver Admin",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 25,
        name: "Editar Usuario",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 26,
        name: "Habilitar/Deshabilitar Usuario",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 27,
        name: "Crear Rol",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 28,
        name: "Editar Rol",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 29,
        name: "Eliminar Rol",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 30,
        name: "Ver Mensajería",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // New permissions
      {
        id: 31,
        name: "Ver Usuarios",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 32,
        name: "Ver Resumen Semanal",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 33,
        name: "Ver Resumen Quincenal",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 34,
        name: "Ver Resumen Mensual",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 35,
        name: "Editar Resumen Semanal",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 36,
        name: "Editar Resumen Quincenal",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 37,
        name: "Editar Resumen Mensual",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 38,
        name: "Reordenar Horarios",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 39,
        name: "Ver Courier",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 40,
        name: "Crear Courier",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 41,
        name: "Editar Courier",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 42,
        name: "Eliminar Courier",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 43,
        name: "Crear Usuario",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    await queryInterface.bulkInsert(
      "permissions",
      permissions.filter((p) => !existingPermissionIds.includes(p.id)),
    );
    const existingRoleIds = (
      await queryInterface.sequelize.query("SELECT id FROM roles", {
        type: queryInterface.sequelize.QueryTypes.SELECT,
      })
    ).map((r) => r.id);

    await queryInterface.bulkInsert(
      "roles",
      [
        { id: 1, name: "Gerencia", createdAt: new Date(), updatedAt: new Date() },
        {
          id: 2,
          name: "Administrativo",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 3,
          name: "Supervisor",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        { id: 4, name: "Usuario", createdAt: new Date(), updatedAt: new Date() },
      ].filter((r) => !existingRoleIds.includes(r.id)),
    );
    const rolePermissions = [
      {
        roleId: 1,
        permissionId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        roleId: 1,
        permissionId: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        roleId: 1,
        permissionId: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        roleId: 1,
        permissionId: 4,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        roleId: 1,
        permissionId: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        roleId: 1,
        permissionId: 6,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        roleId: 1,
        permissionId: 7,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        roleId: 1,
        permissionId: 8,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        roleId: 1,
        permissionId: 9,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        roleId: 1,
        permissionId: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        roleId: 1,
        permissionId: 11,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        roleId: 1,
        permissionId: 12,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        roleId: 1,
        permissionId: 13,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        roleId: 1,
        permissionId: 14,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        roleId: 1,
        permissionId: 15,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        roleId: 1,
        permissionId: 16,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        roleId: 1,
        permissionId: 17,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        roleId: 1,
        permissionId: 18,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        roleId: 1,
        permissionId: 19,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        roleId: 1,
        permissionId: 20,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        roleId: 1,
        permissionId: 21,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        roleId: 1,
        permissionId: 22,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        roleId: 1,
        permissionId: 23,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        roleId: 1,
        permissionId: 24,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        roleId: 1,
        permissionId: 25,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        roleId: 1,
        permissionId: 26,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        roleId: 1,
        permissionId: 27,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        roleId: 1,
        permissionId: 28,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        roleId: 1,
        permissionId: 29,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        roleId: 1,
        permissionId: 30,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // Gerencia — new permissions
      {
        roleId: 1,
        permissionId: 31,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        roleId: 1,
        permissionId: 32,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        roleId: 1,
        permissionId: 33,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        roleId: 1,
        permissionId: 34,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        roleId: 1,
        permissionId: 35,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        roleId: 1,
        permissionId: 36,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        roleId: 1,
        permissionId: 37,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        roleId: 1,
        permissionId: 38,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        roleId: 1,
        permissionId: 39,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        roleId: 1,
        permissionId: 40,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        roleId: 1,
        permissionId: 41,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        roleId: 1,
        permissionId: 42,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        roleId: 1,
        permissionId: 43,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        roleId: 2,
        permissionId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        roleId: 2,
        permissionId: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        roleId: 2,
        permissionId: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        roleId: 2,
        permissionId: 4,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        roleId: 2,
        permissionId: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        roleId: 2,
        permissionId: 6,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        roleId: 2,
        permissionId: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        roleId: 2,
        permissionId: 11,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        roleId: 2,
        permissionId: 12,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        roleId: 2,
        permissionId: 16,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        roleId: 2,
        permissionId: 17,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        roleId: 2,
        permissionId: 18,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        roleId: 2,
        permissionId: 22,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        roleId: 2,
        permissionId: 23,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        roleId: 2,
        permissionId: 30,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        roleId: 3,
        permissionId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        roleId: 3,
        permissionId: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        roleId: 3,
        permissionId: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        roleId: 3,
        permissionId: 4,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        roleId: 3,
        permissionId: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        roleId: 3,
        permissionId: 6,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        roleId: 3,
        permissionId: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        roleId: 3,
        permissionId: 11,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        roleId: 3,
        permissionId: 12,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        roleId: 3,
        permissionId: 16,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        roleId: 3,
        permissionId: 17,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        roleId: 4,
        permissionId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const existingRolePermissionPairs = new Set(
      (
        await queryInterface.sequelize.query(
          'SELECT "roleId", "permissionId" FROM role_permission',
          { type: queryInterface.sequelize.QueryTypes.SELECT },
        )
      ).map((rp) => `${rp.roleId}:${rp.permissionId}`),
    );

    await queryInterface.bulkInsert(
      "role_permission",
      rolePermissions.filter(
        (rp) => !existingRolePermissionPairs.has(`${rp.roleId}:${rp.permissionId}`),
      ),
    );
    const existingUserIds = (
      await queryInterface.sequelize.query("SELECT id FROM users", {
        type: queryInterface.sequelize.QueryTypes.SELECT,
      })
    ).map((u) => u.id);

    await queryInterface.bulkInsert(
      "users",
      [
        {
          id: 1,
          firstName: "Luis",
          lastName: "Herrera",
          email: "luis.herrera_506@hotmail.com",
          username: "lmhq94",
          password: await bcrypt.hash(SEED_PASSWORDS.ADMIN, 10),
          temporalPassword: null,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          firstName: "Daniela",
          lastName: "Miranda",
          email: "info@choferesdealquiler.com",
          username: "danilumix",
          password: await bcrypt.hash(SEED_PASSWORDS.MANAGEMENT, 10),
          temporalPassword: null,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 3,
          firstName: "Damaris",
          lastName: "Arias",
          email: "administrativo@choferesdealquiler.com",
          username: "damarisa",
          password: await bcrypt.hash(SEED_PASSWORDS.ADMIN, 10),
          temporalPassword: null,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 4,
          firstName: "Carlos",
          lastName: "Caamaño",
          email: "servicioalcliente@choferesdealquiler.com",
          username: "carlosc",
          password: await bcrypt.hash(SEED_PASSWORDS.CUSTOMER_SERVICE, 10),
          temporalPassword: null,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ].filter((u) => !existingUserIds.includes(u.id)),
    );
    const existingUserRolePairs = new Set(
      (
        await queryInterface.sequelize.query(
          'SELECT "userId", "roleId" FROM user_role',
          { type: queryInterface.sequelize.QueryTypes.SELECT },
        )
      ).map((ur) => `${ur.userId}:${ur.roleId}`),
    );

    await queryInterface.bulkInsert(
      "user_role",
      [
        { userId: 1, roleId: 1, createdAt: new Date(), updatedAt: new Date() },
        { userId: 2, roleId: 1, createdAt: new Date(), updatedAt: new Date() },
        { userId: 3, roleId: 2, createdAt: new Date(), updatedAt: new Date() },
        { userId: 4, roleId: 3, createdAt: new Date(), updatedAt: new Date() },
      ].filter((ur) => !existingUserRolePairs.has(`${ur.userId}:${ur.roleId}`)),
    );
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete("schedule", null, {});
    await queryInterface.bulkDelete("user_role", null, {});
    await queryInterface.bulkDelete("role_permission", null, {});
    await queryInterface.bulkDelete("users", null, {});
    await queryInterface.bulkDelete("roles", null, {});
    await queryInterface.bulkDelete("permissions", null, {});
  },
};
