"use strict";
const bcrypt = require("bcrypt");
const {
  PERMISSION_DEFINITIONS,
  DEFAULT_ROLE_PERMISSIONS,
  ROLE_NAMES,
} = require("@choferes/shared");

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
    const SELECT = queryInterface.sequelize.QueryTypes.SELECT;
    const now = new Date();

    const existingScheduleIds = (
      await queryInterface.sequelize.query("SELECT id FROM schedule", { type: SELECT })
    ).map((s) => s.id);

    await queryInterface.bulkInsert(
      "schedule",
      [
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
    ].filter((s) => !existingScheduleIds.includes(s.id)));

    const existingScheduleDayPairs = new Set(
      (
        await queryInterface.sequelize.query(
          'SELECT "scheduleId", day FROM schedule_day',
          { type: SELECT },
        )
      ).map((sd) => `${sd.scheduleId}:${sd.day}`),
    );

    await queryInterface.bulkInsert(
      "schedule_day",
      [
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
    ].filter(
      (sd) => !existingScheduleDayPairs.has(`${sd.scheduleId}:${sd.day}`),
    ));

    // ── Permissions ──────────────────────────────────────────────────────────
    // Seeded from the shared catalog. Idempotent: existing codes are skipped.
    const existingPermissionCodes = new Set(
      (
        await queryInterface.sequelize.query("SELECT code FROM permissions", { type: SELECT })
      ).map((p) => p.code),
    );

    const permissionsToInsert = PERMISSION_DEFINITIONS.filter(
      (definition) => !existingPermissionCodes.has(definition.code),
    ).map((definition) => ({
      code: definition.code,
      module: definition.module,
      name: definition.label,
      createdAt: now,
      updatedAt: now,
    }));

    if (permissionsToInsert.length > 0) {
      await queryInterface.bulkInsert("permissions", permissionsToInsert);
    }

    // ── Roles ────────────────────────────────────────────────────────────────
    const existingRoleNames = new Set(
      (await queryInterface.sequelize.query("SELECT name FROM roles", { type: SELECT })).map(
        (r) => r.name,
      ),
    );

    const rolesToInsert = ROLE_NAMES.filter((name) => !existingRoleNames.has(name)).map(
      (name) => ({ name, createdAt: now, updatedAt: now }),
    );

    if (rolesToInsert.length > 0) {
      await queryInterface.bulkInsert("roles", rolesToInsert);
    }

    // ── Role permissions ─────────────────────────────────────────────────────
    // Assigned by stable code, so it never depends on auto-increment ids.
    const permissionIdByCode = new Map(
      (
        await queryInterface.sequelize.query("SELECT id, code FROM permissions", { type: SELECT })
      ).map((p) => [p.code, p.id]),
    );
    const roleIdByName = new Map(
      (await queryInterface.sequelize.query("SELECT id, name FROM roles", { type: SELECT })).map(
        (r) => [r.name, r.id],
      ),
    );

    const existingRolePermissionPairs = new Set(
      (
        await queryInterface.sequelize.query(
          'SELECT "roleId", "permissionId" FROM role_permission',
          { type: SELECT },
        )
      ).map((rp) => `${rp.roleId}:${rp.permissionId}`),
    );

    const rolePermissions = [];
    for (const [roleName, codes] of Object.entries(DEFAULT_ROLE_PERMISSIONS)) {
      const roleId = roleIdByName.get(roleName);
      if (!roleId) continue;
      for (const code of codes) {
        const permissionId = permissionIdByCode.get(code);
        if (!permissionId) continue;
        const pair = `${roleId}:${permissionId}`;
        if (existingRolePermissionPairs.has(pair)) continue;
        existingRolePermissionPairs.add(pair);
        rolePermissions.push({ roleId, permissionId, createdAt: now, updatedAt: now });
      }
    }

    if (rolePermissions.length > 0) {
      await queryInterface.bulkInsert("role_permission", rolePermissions);
    }

    // ── Users ────────────────────────────────────────────────────────────────
    const existingUsernames = new Set(
      (await queryInterface.sequelize.query("SELECT username FROM users", { type: SELECT })).map(
        (u) => u.username,
      ),
    );

    await queryInterface.bulkInsert(
      "users",
      [
        {
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
      ].filter((u) => !existingUsernames.has(u.username)),
    );

    // ── User roles ───────────────────────────────────────────────────────────
    // Resolved by username + role name instead of hardcoded ids.
    const usernameToId = new Map(
      (await queryInterface.sequelize.query("SELECT id, username FROM users", { type: SELECT })).map(
        (u) => [u.username, u.id],
      ),
    );
    const roleNameToId = new Map(
      (await queryInterface.sequelize.query("SELECT id, name FROM roles", { type: SELECT })).map(
        (r) => [r.name, r.id],
      ),
    );

    const userRoleSpec = [
      { username: "lmhq94", role: "Gerencia" },
      { username: "danilumix", role: "Gerencia" },
      { username: "damarisa", role: "Administrativo" },
      { username: "carlosc", role: "Supervisor" },
    ];

    const existingUserRolePairs = new Set(
      (
        await queryInterface.sequelize.query('SELECT "userId", "roleId" FROM user_role', {
          type: SELECT,
        })
      ).map((ur) => `${ur.userId}:${ur.roleId}`),
    );

    const userRoles = [];
    for (const { username, role } of userRoleSpec) {
      const userId = usernameToId.get(username);
      const roleId = roleNameToId.get(role);
      if (!userId || !roleId) continue;
      const pair = `${userId}:${roleId}`;
      if (existingUserRolePairs.has(pair)) continue;
      existingUserRolePairs.add(pair);
      userRoles.push({ userId, roleId, createdAt: now, updatedAt: now });
    }

    if (userRoles.length > 0) {
      await queryInterface.bulkInsert("user_role", userRoles);
    }
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete("schedule_day", null, {});
    await queryInterface.bulkDelete("schedule", null, {});
    await queryInterface.bulkDelete("user_role", null, {});
    await queryInterface.bulkDelete("role_permission", null, {});
    await queryInterface.bulkDelete("users", null, {});
    await queryInterface.bulkDelete("roles", null, {});
    await queryInterface.bulkDelete("permissions", null, {});
  },
};
