"use strict";

/**
 * Normalises the permission catalog.
 *
 * Permissions used to be identified by their Spanish display name, which made
 * authorization depend on user-facing copy. This migration introduces a stable
 * `code` (e.g. "employees:view") plus a `module` for UI grouping, and makes the
 * database converge on the canonical catalog regardless of whether the database
 * is fresh or already seeded:
 *
 *   1. add `code` / `module` columns (idempotent)
 *   2. advance the id sequence (legacy rows were inserted with explicit ids)
 *   3. upsert every catalog permission by `code` (matching legacy rows by name)
 *   4. delete permissions that are not part of the catalog
 *   5. dedupe and add a unique index on role_permission(roleId, permissionId)
 *   6. enforce NOT NULL + unique index on permissions.code
 *   7. apply default role permissions to roles that have none yet
 *
 * The catalog is inlined on purpose: migrations are immutable snapshots and must
 * not depend on application code that can change later.
 *
 * @type {import('sequelize-cli').Migration}
 */

// [code, module, label]
const CATALOG = [
  ["roles:view", "Roles", "Ver Roles"],
  ["roles:hours:view", "Roles", "Ver Horas de Empleados"],
  ["roles:hours:edit", "Roles", "Editar Roles de Empleados"],
  ["roles:export:excel", "Roles", "Exportar Excel de Roles de Empleados"],
  ["roles:export:pdf", "Roles", "Exportar PDF de Roles de Empleados"],
  ["roles:create", "Roles", "Crear Rol"],
  ["roles:edit", "Roles", "Editar Rol"],
  ["roles:delete", "Roles", "Eliminar Rol"],

  ["employees:view", "Empleados", "Ver Empleados"],
  ["employees:create", "Empleados", "Crear Empleado"],
  ["employees:edit", "Empleados", "Editar Empleado"],
  ["employees:delete", "Empleados", "Eliminar Empleado"],
  ["employees:export:excel", "Empleados", "Exportar Excel de Empleados"],
  ["employees:export:pdf", "Empleados", "Exportar PDF de Empleados"],

  ["schedules:view", "Horarios", "Ver Horarios"],
  ["schedules:create", "Horarios", "Crear Horario"],
  ["schedules:edit", "Horarios", "Editar Horario"],
  ["schedules:delete", "Horarios", "Eliminar Horario"],
  ["schedules:reorder", "Horarios", "Reordenar Horarios"],
  ["schedules:export:excel", "Horarios", "Exportar Excel de Horarios"],
  ["schedules:export:pdf", "Horarios", "Exportar PDF de Horarios"],

  ["vehicles:view", "Vehículos", "Ver Vehículos"],
  ["vehicles:create", "Vehículos", "Crear Vehículo"],
  ["vehicles:edit", "Vehículos", "Editar Vehículo"],
  ["vehicles:delete", "Vehículos", "Eliminar Vehículo"],
  ["vehicles:export:excel", "Vehículos", "Exportar Excel de Vehículos"],
  ["vehicles:export:pdf", "Vehículos", "Exportar PDF de Vehículos"],

  ["users:view", "Usuarios", "Ver Usuarios"],
  ["users:create", "Usuarios", "Crear Usuario"],
  ["users:edit", "Usuarios", "Editar Usuario"],
  ["users:toggle-active", "Usuarios", "Habilitar/Deshabilitar Usuario"],
  ["admin:view", "Admin", "Ver Admin"],

  ["summaries:weekly:view", "Resúmenes", "Ver Resumen Semanal"],
  ["summaries:weekly:edit", "Resúmenes", "Editar Resumen Semanal"],
  ["summaries:biweekly:view", "Resúmenes", "Ver Resumen Quincenal"],
  ["summaries:biweekly:edit", "Resúmenes", "Editar Resumen Quincenal"],
  ["summaries:monthly:view", "Resúmenes", "Ver Resumen Mensual"],
  ["summaries:monthly:edit", "Resúmenes", "Editar Resumen Mensual"],

  ["messaging:view", "Mensajería", "Ver Mensajería"],
  ["courier:view", "Courier", "Ver Courier"],
  ["courier:create", "Courier", "Crear Courier"],
  ["courier:edit", "Courier", "Editar Courier"],
  ["courier:delete", "Courier", "Eliminar Courier"],

  ["payments:view", "Pagos", "Ver Pagos"],
  ["payments:create", "Pagos", "Crear Pago"],
  ["payments:edit", "Pagos", "Editar Pago"],
  ["payments:delete", "Pagos", "Eliminar Pago"],
  ["payments:send-email", "Pagos", "Enviar Pago por Correo"],

  ["vacations:view", "Vacaciones", "Ver Vacaciones"],
  ["vacations:create", "Vacaciones", "Crear Vacación"],
  ["vacations:edit", "Vacaciones", "Editar Vacación"],
  ["vacations:delete", "Vacaciones", "Eliminar Vacación"],
];

const ALL_CODES = CATALOG.map(([code]) => code);

const DEFAULT_ROLE_PERMISSIONS = {
  Gerencia: ALL_CODES,
  Administrativo: [
    "roles:view",
    "roles:hours:view",
    "roles:hours:edit",
    "roles:export:excel",
    "roles:export:pdf",
    "employees:view",
    "employees:export:excel",
    "employees:export:pdf",
    "schedules:view",
    "schedules:export:excel",
    "schedules:export:pdf",
    "vehicles:view",
    "vehicles:export:excel",
    "vehicles:export:pdf",
    "messaging:view",
    "payments:view",
    "payments:create",
    "payments:edit",
    "payments:send-email",
    "vacations:view",
    "vacations:create",
    "vacations:edit",
  ],
  Supervisor: [
    "roles:view",
    "roles:hours:view",
    "roles:hours:edit",
    "roles:export:excel",
    "roles:export:pdf",
    "employees:view",
    "employees:export:excel",
    "employees:export:pdf",
    "schedules:view",
    "schedules:export:excel",
    "schedules:export:pdf",
  ],
  Usuario: ["roles:view"],
};

const SELECT = (sequelize) => sequelize.QueryTypes.SELECT;

const columnExists = async (queryInterface, table, column) => {
  const rows = await queryInterface.sequelize.query(
    `SELECT column_name FROM information_schema.columns
     WHERE table_name = :table AND column_name = :column`,
    {
      replacements: { table, column },
      type: SELECT(queryInterface.sequelize),
    },
  );
  return rows.length > 0;
};

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const { sequelize } = queryInterface;
    const now = new Date();

    // 1. Columns (idempotent)
    if (!(await columnExists(queryInterface, "permissions", "code"))) {
      await queryInterface.addColumn("permissions", "code", {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }
    if (!(await columnExists(queryInterface, "permissions", "module"))) {
      await queryInterface.addColumn("permissions", "module", {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }

    // 2. Advance the id sequence: legacy rows were inserted with explicit ids,
    //    so the sequence can lag behind and collide with new inserts.
    await sequelize.query(
      `SELECT setval(
         pg_get_serial_sequence('permissions', 'id'),
         COALESCE((SELECT MAX(id) FROM permissions), 0) + 1,
         false
       )`,
    );

    // 3. Upsert catalog permissions by code (fall back to matching by name).
    for (const [code, moduleName, label] of CATALOG) {
      const byCode = await sequelize.query("SELECT id FROM permissions WHERE code = :code", {
        replacements: { code },
        type: SELECT(sequelize),
      });
      if (byCode.length > 0) {
        await sequelize.query(
          `UPDATE permissions SET name = :label, module = :moduleName, "updatedAt" = :now
           WHERE code = :code`,
          { replacements: { label, moduleName, now, code } },
        );
        continue;
      }

      const byName = await sequelize.query("SELECT id FROM permissions WHERE name = :label", {
        replacements: { label },
        type: SELECT(sequelize),
      });
      if (byName.length > 0) {
        await sequelize.query(
          `UPDATE permissions SET code = :code, module = :moduleName, "updatedAt" = :now
           WHERE id = :id`,
          { replacements: { code, moduleName, now, id: byName[0].id } },
        );
        continue;
      }

      await queryInterface.bulkInsert("permissions", [
        { code, module: moduleName, name: label, createdAt: now, updatedAt: now },
      ]);
    }

    // 4. Remove permissions that are no longer part of the catalog.
    const obsolete = await sequelize.query(
      "SELECT id FROM permissions WHERE code IS NULL OR code NOT IN (:codes)",
      { replacements: { codes: ALL_CODES }, type: SELECT(sequelize) },
    );
    if (obsolete.length > 0) {
      const ids = obsolete.map((row) => row.id);
      await queryInterface.bulkDelete("role_permission", { permissionId: ids });
      await queryInterface.bulkDelete("permissions", { id: ids });
    }

    // 5. Dedupe role_permission and enforce one pair per (role, permission).
    await sequelize.query(
      `DELETE FROM role_permission a
       USING role_permission b
       WHERE a.ctid < b.ctid
         AND a."roleId" = b."roleId"
         AND a."permissionId" = b."permissionId"`,
    );
    await sequelize.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS role_permission_role_permission_unique
       ON role_permission ("roleId", "permissionId")`,
    );

    // 6. Enforce the new invariants on permissions.
    await sequelize.query("ALTER TABLE permissions ALTER COLUMN code SET NOT NULL");
    await sequelize.query("ALTER TABLE permissions ALTER COLUMN module SET NOT NULL");
    await sequelize.query(
      "CREATE UNIQUE INDEX IF NOT EXISTS permissions_code_unique ON permissions (code)",
    );

    // 7. Baseline permissions for known roles that have none yet. Existing
    //    customised roles are left untouched.
    const roles = await sequelize.query("SELECT id, name FROM roles", { type: SELECT(sequelize) });
    const permissionRows = await sequelize.query("SELECT id, code FROM permissions", {
      type: SELECT(sequelize),
    });
    const permissionIdByCode = new Map(permissionRows.map((p) => [p.code, p.id]));

    for (const role of roles) {
      const defaults = DEFAULT_ROLE_PERMISSIONS[role.name];
      if (!defaults) continue;

      const existing = await sequelize.query(
        'SELECT 1 FROM role_permission WHERE "roleId" = :roleId LIMIT 1',
        { replacements: { roleId: role.id }, type: SELECT(sequelize) },
      );
      if (existing.length > 0) continue;

      const rows = defaults
        .map((code) => permissionIdByCode.get(code))
        .filter((permissionId) => permissionId !== undefined)
        .map((permissionId) => ({
          roleId: role.id,
          permissionId,
          createdAt: now,
          updatedAt: now,
        }));
      if (rows.length > 0) {
        await queryInterface.bulkInsert("role_permission", rows);
      }
    }
  },

  down: async (queryInterface) => {
    await queryInterface.sequelize.query("DROP INDEX IF EXISTS role_permission_role_permission_unique");
    await queryInterface.sequelize.query("DROP INDEX IF EXISTS permissions_code_unique");
    await queryInterface.removeColumn("permissions", "code");
    await queryInterface.removeColumn("permissions", "module");
  },
};
