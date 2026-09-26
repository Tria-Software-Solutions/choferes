"use strict";

/**
 * Permisos de Licencias de conducir y Amonestaciones.
 *
 * Se insertan por `code` (identidad estable), nunca por id ni por label, para
 * que la migración sea idempotente y funcione igual en una BD fresca (donde el
 * seeder ya sembró el catálogo) y en una existente. Corre DESPUÉS de
 * 20260926000000-normalize-permission-catalog, que deja `code`/`module` NOT NULL.
 *
 * Gerencia: todos. Administrativo: ver/crear/editar. Supervisor: solo ver.
 *
 * @type {import('sequelize-cli').Migration}
 */

// [code, module, label]
const CATALOG = [
  ["licenses:view", "Licencias", "Ver Licencias"],
  ["licenses:create", "Licencias", "Crear Licencia"],
  ["licenses:edit", "Licencias", "Editar Licencia"],
  ["licenses:delete", "Licencias", "Eliminar Licencia"],
  ["disciplinary:view", "Amonestaciones", "Ver Amonestaciones"],
  ["disciplinary:create", "Amonestaciones", "Crear Amonestación"],
  ["disciplinary:edit", "Amonestaciones", "Editar Amonestación"],
  ["disciplinary:delete", "Amonestaciones", "Eliminar Amonestación"],
];

const ALL_CODES = CATALOG.map(([code]) => code);

const ROLE_CODES = {
  Gerencia: ALL_CODES,
  Administrativo: [
    "licenses:view",
    "licenses:create",
    "licenses:edit",
    "disciplinary:view",
    "disciplinary:create",
    "disciplinary:edit",
  ],
  Supervisor: ["licenses:view", "disciplinary:view"],
};

module.exports = {
  up: async (queryInterface) => {
    const { sequelize } = queryInterface;
    const SELECT = sequelize.QueryTypes.SELECT;
    const now = new Date();

    // 1. Advance the id sequence (legacy rows used explicit ids) so new inserts
    //    never collide.
    await sequelize.query(
      `SELECT setval(
         pg_get_serial_sequence('permissions', 'id'),
         COALESCE((SELECT MAX(id) FROM permissions), 0) + 1,
         false
       )`,
    );

    // 2. Upsert each catalog permission by code.
    for (const [code, moduleName, label] of CATALOG) {
      const existing = await sequelize.query("SELECT id FROM permissions WHERE code = :code", {
        replacements: { code },
        type: SELECT,
      });
      if (existing.length > 0) {
        await sequelize.query(
          `UPDATE permissions SET name = :label, module = :moduleName, "updatedAt" = :now
           WHERE code = :code`,
          { replacements: { label, moduleName, now, code } },
        );
        continue;
      }
      await queryInterface.bulkInsert("permissions", [
        { code, module: moduleName, name: label, createdAt: now, updatedAt: now },
      ]);
    }

    // 3. Assign the new permissions to the seeded roles (by name, not id).
    const permissionIdByCode = new Map(
      (
        await sequelize.query("SELECT id, code FROM permissions WHERE code IN (:codes)", {
          replacements: { codes: ALL_CODES },
          type: SELECT,
        })
      ).map((p) => [p.code, p.id]),
    );
    const roleIdByName = new Map(
      (
        await sequelize.query("SELECT id, name FROM roles", { type: SELECT })
      ).map((r) => [r.name, r.id]),
    );
    const existingPairs = new Set(
      (
        await sequelize.query('SELECT "roleId", "permissionId" FROM role_permission', {
          type: SELECT,
        })
      ).map((rp) => `${rp.roleId}:${rp.permissionId}`),
    );

    const rows = [];
    for (const [roleName, codes] of Object.entries(ROLE_CODES)) {
      const roleId = roleIdByName.get(roleName);
      if (!roleId) continue;
      for (const code of codes) {
        const permissionId = permissionIdByCode.get(code);
        if (!permissionId) continue;
        const pair = `${roleId}:${permissionId}`;
        if (existingPairs.has(pair)) continue;
        existingPairs.add(pair);
        rows.push({ roleId, permissionId, createdAt: now, updatedAt: now });
      }
    }

    if (rows.length > 0) {
      await queryInterface.bulkInsert("role_permission", rows);
    }
  },

  down: async (queryInterface) => {
    const SELECT = queryInterface.sequelize.QueryTypes.SELECT;
    const ids = (
      await queryInterface.sequelize.query(
        "SELECT id FROM permissions WHERE code IN (:codes)",
        { replacements: { codes: ALL_CODES }, type: SELECT },
      )
    ).map((row) => row.id);

    if (ids.length > 0) {
      await queryInterface.bulkDelete("role_permission", { permissionId: ids });
      await queryInterface.bulkDelete("permissions", { id: ids });
    }
  },
};
