"use strict";

// Permisos de la página de Documentos. El seeder los aplica en bases nuevas,
// pero una base ya sembrada no vuelve a correrlo: esta migración inserta las
// filas que falten y las asigna a los roles de gestión.
//
// `documents:view` / `documents:manage`:
//  - Gerencia y SysAdmin: catálogo completo (ambos).
//  - Administrativo: ver + administrar (sube carpetas y archivos).
//  - Roles operativos: sin acceso a la página; ven sus documentos en Mi Panel.
const {
  PERMISSION_DEFINITIONS,
  DEFAULT_ROLE_PERMISSIONS,
} = require("@choferes/shared");

const NEW_CODES = ["documents:view", "documents:manage"];

module.exports = {
  async up(queryInterface) {
    const { sequelize } = queryInterface;
    const SELECT = sequelize.QueryTypes.SELECT;

    await sequelize.transaction(async (transaction) => {
      const now = new Date();

      const existingCodes = new Set(
        (
          await sequelize.query("SELECT code FROM permissions", {
            type: SELECT,
            transaction,
          })
        ).map((p) => p.code),
      );

      const permissionsToInsert = PERMISSION_DEFINITIONS.filter(
        (definition) => NEW_CODES.includes(definition.code) && !existingCodes.has(definition.code),
      ).map((definition) => ({
        code: definition.code,
        module: definition.module,
        name: definition.label,
        createdAt: now,
        updatedAt: now,
      }));

      if (permissionsToInsert.length > 0) {
        await queryInterface.bulkInsert("permissions", permissionsToInsert, { transaction });
      }

      const permissionIdByCode = new Map(
        (
          await sequelize.query("SELECT id, code FROM permissions", {
            type: SELECT,
            transaction,
          })
        ).map((p) => [p.code, p.id]),
      );
      const roleIdByName = new Map(
        (
          await sequelize.query("SELECT id, name FROM roles", {
            type: SELECT,
            transaction,
          })
        ).map((r) => [r.name, r.id]),
      );
      const existingPairs = new Set(
        (
          await sequelize.query('SELECT "roleId", "permissionId" FROM role_permission', {
            type: SELECT,
            transaction,
          })
        ).map((rp) => `${rp.roleId}:${rp.permissionId}`),
      );

      const rows = [];
      for (const [roleName, codes] of Object.entries(DEFAULT_ROLE_PERMISSIONS)) {
        const roleId = roleIdByName.get(roleName);
        if (!roleId) continue;
        for (const code of NEW_CODES) {
          if (!codes.includes(code)) continue;
          const permissionId = permissionIdByCode.get(code);
          if (!permissionId) continue;
          const pair = `${roleId}:${permissionId}`;
          if (existingPairs.has(pair)) continue;
          existingPairs.add(pair);
          rows.push({ roleId, permissionId, createdAt: now, updatedAt: now });
        }
      }

      if (rows.length > 0) {
        await queryInterface.bulkInsert("role_permission", rows, { transaction });
      }
    });
  },

  async down(queryInterface) {
    const { sequelize } = queryInterface;
    await sequelize.transaction(async (transaction) => {
      await sequelize.query(
        `DELETE FROM role_permission
         WHERE "permissionId" IN (SELECT id FROM permissions WHERE code IN (:codes))`,
        { replacements: { codes: NEW_CODES }, transaction },
      );
      await sequelize.query("DELETE FROM permissions WHERE code IN (:codes)", {
        replacements: { codes: NEW_CODES },
        transaction,
      });
    });
  },
};
