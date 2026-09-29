"use strict";

/**
 * Refactor del catálogo de permisos.
 *
 * Reemplaza el esquema viejo e inconsistente (`roles:hours:view`,
 * `summaries:weekly:view`, `disciplinary:*`, export separado en excel/pdf...)
 * por uno uniforme `<recurso>:<acción>` con recursos en plural, consolida las
 * exportaciones en un único permiso `*:export`, y agrega cobertura total,
 * incluido el autoservicio (perfil, notificaciones, solicitud de vacaciones).
 *
 * Estrategia, idempotente:
 *   1. asegura las columnas `code` / `module`
 *   2. aplica los renombres reusando la fila existente (conserva role_permission);
 *      cuando dos códigos viejos colapsan en uno (excel + pdf), mueve las
 *      asignaciones al nuevo y borra el sobrante sin duplicar pares rol-permiso
 *   3. hace upsert de cada permiso del catálogo nuevo (nombre + módulo)
 *   4. borra permisos que ya no forman parte del catálogo
 *   5. garantiza el paquete de autoservicio en todos los roles
 *   6. devuelve el catálogo completo a Gerencia
 *   7. recrea los índices únicos
 *
 * El catálogo se inlinea a propósito: las migraciones son snapshots inmutables y
 * no deben depender de código de aplicación que puede cambiar después.
 *
 * @type {import('sequelize-cli').Migration}
 */

// [code, module, label]
const CATALOG = [
  ["my-panel:view", "Mi Panel", "Ver Mi Panel"],

  ["employees:view", "Empleados", "Ver Empleados"],
  ["employees:create", "Empleados", "Crear Empleado"],
  ["employees:edit", "Empleados", "Editar Empleado"],
  ["employees:delete", "Empleados", "Eliminar Empleado"],
  ["employees:export", "Empleados", "Exportar Empleados"],

  ["roles:view", "Roles", "Ver Roles"],
  ["roles:create", "Roles", "Crear Rol"],
  ["roles:edit", "Roles", "Editar Rol"],
  ["roles:delete", "Roles", "Eliminar Rol"],
  ["roles:export", "Roles", "Exportar Roles"],
  ["employee-hours:view", "Roles", "Ver Horas de Empleados"],
  ["employee-hours:edit", "Roles", "Editar Horas de Empleados"],

  ["schedules:view", "Horarios", "Ver Horarios"],
  ["schedules:create", "Horarios", "Crear Horario"],
  ["schedules:edit", "Horarios", "Editar Horario"],
  ["schedules:delete", "Horarios", "Eliminar Horario"],
  ["schedules:reorder", "Horarios", "Reordenar Horarios"],
  ["schedules:export", "Horarios", "Exportar Horarios"],

  ["vehicles:view", "Vehículos", "Ver Vehículos"],
  ["vehicles:create", "Vehículos", "Crear Vehículo"],
  ["vehicles:edit", "Vehículos", "Editar Vehículo"],
  ["vehicles:delete", "Vehículos", "Eliminar Vehículo"],
  ["vehicles:export", "Vehículos", "Exportar Vehículos"],

  ["weekly-summaries:view", "Resúmenes", "Ver Resumen Semanal"],
  ["weekly-summaries:edit", "Resúmenes", "Editar Resumen Semanal"],
  ["biweekly-summaries:view", "Resúmenes", "Ver Resumen Quincenal"],
  ["biweekly-summaries:edit", "Resúmenes", "Editar Resumen Quincenal"],
  ["monthly-summaries:view", "Resúmenes", "Ver Resumen Mensual"],
  ["monthly-summaries:edit", "Resúmenes", "Editar Resumen Mensual"],

  ["payments:view", "Pagos", "Ver Pagos"],
  ["payments:create", "Pagos", "Crear Pago"],
  ["payments:edit", "Pagos", "Editar Pago"],
  ["payments:delete", "Pagos", "Eliminar Pago"],
  ["payments:send-email", "Pagos", "Enviar Pago por Correo"],

  ["vacations:view", "Vacaciones", "Ver Vacaciones"],
  ["vacations:create", "Vacaciones", "Crear Vacación"],
  ["vacations:edit", "Vacaciones", "Editar Vacación"],
  ["vacations:delete", "Vacaciones", "Eliminar Vacación"],
  ["vacations:request", "Vacaciones", "Solicitar Mis Vacaciones"],

  ["licenses:view", "Licencias", "Ver Licencias"],
  ["licenses:create", "Licencias", "Crear Licencia"],
  ["licenses:edit", "Licencias", "Editar Licencia"],
  ["licenses:delete", "Licencias", "Eliminar Licencia"],

  ["disciplinary-actions:view", "Amonestaciones", "Ver Amonestaciones"],
  ["disciplinary-actions:create", "Amonestaciones", "Crear Amonestación"],
  ["disciplinary-actions:edit", "Amonestaciones", "Editar Amonestación"],
  ["disciplinary-actions:delete", "Amonestaciones", "Eliminar Amonestación"],

  ["tasks:view", "Tareas", "Ver Tareas"],
  ["tasks:create", "Tareas", "Crear Tarea"],
  ["tasks:edit", "Tareas", "Editar Tarea"],
  ["tasks:delete", "Tareas", "Eliminar Tarea"],

  ["users:view", "Usuarios", "Ver Usuarios"],
  ["users:create", "Usuarios", "Crear Usuario"],
  ["users:edit", "Usuarios", "Editar Usuario"],
  ["users:delete", "Usuarios", "Eliminar Usuario"],
  ["users:toggle-active", "Usuarios", "Habilitar o Deshabilitar Usuario"],
  ["admin:view", "Administración", "Ver Panel de Administración"],

  ["profile:view", "Perfil", "Ver Mi Perfil"],
  ["profile:edit", "Perfil", "Editar Mi Perfil"],

  ["notifications:view", "Notificaciones", "Ver Notificaciones"],
  ["notifications:edit", "Notificaciones", "Marcar Notificaciones como Leídas"],
  ["notifications:delete", "Notificaciones", "Eliminar Notificaciones"],
];

// [oldCode, newCode] — el orden importa cuando varios viejos colapsan en uno.
const RENAMES = [
  ["roles:hours:view", "employee-hours:view"],
  ["roles:hours:edit", "employee-hours:edit"],
  ["roles:export:excel", "roles:export"],
  ["roles:export:pdf", "roles:export"],
  ["employees:export:excel", "employees:export"],
  ["employees:export:pdf", "employees:export"],
  ["schedules:export:excel", "schedules:export"],
  ["schedules:export:pdf", "schedules:export"],
  ["vehicles:export:excel", "vehicles:export"],
  ["vehicles:export:pdf", "vehicles:export"],
  ["dashboard:self:view", "my-panel:view"],
  ["summaries:weekly:view", "weekly-summaries:view"],
  ["summaries:weekly:edit", "weekly-summaries:edit"],
  ["summaries:biweekly:view", "biweekly-summaries:view"],
  ["summaries:biweekly:edit", "biweekly-summaries:edit"],
  ["summaries:monthly:view", "monthly-summaries:view"],
  ["summaries:monthly:edit", "monthly-summaries:edit"],
  ["disciplinary:view", "disciplinary-actions:view"],
  ["disciplinary:create", "disciplinary-actions:create"],
  ["disciplinary:edit", "disciplinary-actions:edit"],
  ["disciplinary:delete", "disciplinary-actions:delete"],
];

const ALL_CODES = CATALOG.map(([code]) => code);

const SELF_SERVICE_CODES = [
  "my-panel:view",
  "profile:view",
  "profile:edit",
  "notifications:view",
  "notifications:edit",
  "notifications:delete",
  "tasks:view",
  "tasks:create",
  "tasks:edit",
  "tasks:delete",
  "vacations:request",
];

const SELECT = (sequelize) => sequelize.QueryTypes.SELECT;

const columnExists = async (queryInterface, table, column) => {
  const rows = await queryInterface.sequelize.query(
    `SELECT column_name FROM information_schema.columns
     WHERE table_name = :table AND column_name = :column`,
    { replacements: { table, column }, type: SELECT(queryInterface.sequelize) },
  );
  return rows.length > 0;
};

const findIdByCode = async (sequelize, code) => {
  const rows = await sequelize.query("SELECT id FROM permissions WHERE code = :code LIMIT 1", {
    replacements: { code },
    type: SELECT(sequelize),
  });
  return rows.length > 0 ? rows[0].id : null;
};

const grantCodes = async (queryInterface, roleNames, codes, now) => {
  await queryInterface.sequelize.query(
    `INSERT INTO role_permission ("roleId", "permissionId", "createdAt", "updatedAt")
     SELECT r.id, p.id, :now, :now
     FROM roles r CROSS JOIN permissions p
     WHERE r.name IN (:roleNames) AND p.code IN (:codes)
       AND NOT EXISTS (
         SELECT 1 FROM role_permission rp
         WHERE rp."roleId" = r.id AND rp."permissionId" = p.id
       )`,
    { replacements: { roleNames, codes, now } },
  );
};

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const { sequelize } = queryInterface;
    const now = new Date();

    // 1. Columnas (idempotente)
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

    // Secuencia al día (filas legacy se insertaron con ids explícitos).
    await sequelize.query(
      `SELECT setval(
         pg_get_serial_sequence('permissions', 'id'),
         COALESCE((SELECT MAX(id) FROM permissions), 0) + 1,
         false
       )`,
    );

    // 2. Renombres reusando la fila cuando se puede.
    for (const [oldCode, newCode] of RENAMES) {
      const oldId = await findIdByCode(sequelize, oldCode);
      if (oldId === null) continue;

      const newId = await findIdByCode(sequelize, newCode);
      if (newId === null) {
        await sequelize.query(
          `UPDATE permissions SET code = :newCode, "updatedAt" = :now WHERE id = :oldId`,
          { replacements: { newCode, now, oldId } },
        );
        continue;
      }

      // Colisión (p. ej. excel + pdf -> export): mueve asignaciones sin duplicar.
      await sequelize.query(
        `UPDATE role_permission SET "permissionId" = :newId, "updatedAt" = :now
         WHERE "permissionId" = :oldId
           AND "roleId" NOT IN (
             SELECT "roleId" FROM role_permission WHERE "permissionId" = :newId
           )`,
        { replacements: { newId, oldId, now } },
      );
      await sequelize.query(`DELETE FROM role_permission WHERE "permissionId" = :oldId`, {
        replacements: { oldId },
      });
      await sequelize.query(`DELETE FROM permissions WHERE id = :oldId`, {
        replacements: { oldId },
      });
    }

    // 3. Upsert del catálogo nuevo por code (nombre legible + módulo).
    for (const [code, moduleName, label] of CATALOG) {
      const id = await findIdByCode(sequelize, code);
      if (id === null) {
        await queryInterface.bulkInsert("permissions", [
          { code, module: moduleName, name: label, createdAt: now, updatedAt: now },
        ]);
      } else {
        await sequelize.query(
          `UPDATE permissions SET name = :label, module = :moduleName, "updatedAt" = :now
           WHERE id = :id`,
          { replacements: { label, moduleName, now, id } },
        );
      }
    }

    // 4. Fuera del catálogo.
    await sequelize.query(
      `DELETE FROM role_permission
       WHERE "permissionId" IN (
         SELECT id FROM permissions WHERE code IS NULL OR code NOT IN (:codes)
       )`,
      { replacements: { codes: ALL_CODES } },
    );
    await sequelize.query(
      "DELETE FROM permissions WHERE code IS NULL OR code NOT IN (:codes)",
      { replacements: { codes: ALL_CODES } },
    );

    // 5. Autoservicio para todos los roles, incluidos los personalizados.
    await grantCodes(queryInterface, [...ALL_CODES], SELF_SERVICE_CODES, now);

    // 5b. Normaliza los roles sembrados a su set por defecto (una base existente
    //     no debe conservar los permisos viejos). Roles personalizados quedan
    //     intactos salvo por el autoservicio del paso anterior.
    // "Mi Panel" es la vista personal del empleado: no va en roles de gestión.
    const EMPLOYEE_ONLY = ["my-panel:view"];
    const withoutEmployeeOnly = (codes) => codes.filter((code) => !EMPLOYEE_ONLY.includes(code));

    const readOnlyCodes = withoutEmployeeOnly(
      CATALOG.filter(
        ([code]) => code.endsWith(":view") || code.endsWith(":export"),
      ).map(([code]) => code),
    );
    const supervisorCodes = [
      ...SELF_SERVICE_CODES,
      "roles:view",
      "employee-hours:view",
      "employees:view",
      "schedules:view",
      "weekly-summaries:view",
      "biweekly-summaries:view",
      "monthly-summaries:view",
    ];
    const seededRoles = {
      Gerencia: withoutEmployeeOnly(ALL_CODES),
      // Igual que Gerencia pero solo lectura: ver y exportar. Nada de modificar.
      Administrativo: [...readOnlyCodes, ...withoutEmployeeOnly(SELF_SERVICE_CODES)],
      // Autoservicio + lectura del tablero de Roles.
      Supervisor: supervisorCodes,
      "Chofer Coordinador": SELF_SERVICE_CODES,
      Recepcionista: SELF_SERVICE_CODES,
      Chofer: SELF_SERVICE_CODES,
      // Rol especial con acceso total. Todavía se llama "Usuario": el renombre a
      // "SysAdmin" ocurre en 20261009000000-rename-usuario-to-sysadmin.
      Usuario: withoutEmployeeOnly(ALL_CODES),
    };

    for (const [roleName, codes] of Object.entries(seededRoles)) {
      await sequelize.query(
        `DELETE FROM role_permission
         WHERE "roleId" IN (SELECT id FROM roles WHERE name = :roleName)`,
        { replacements: { roleName } },
      );
      await grantCodes(queryInterface, [roleName], [...new Set(codes)], now);
    }

    // 6. Invariantes e índices.
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
    await sequelize.query("ALTER TABLE permissions ALTER COLUMN code SET NOT NULL");
    await sequelize.query("ALTER TABLE permissions ALTER COLUMN module SET NOT NULL");
    await sequelize.query(
      "CREATE UNIQUE INDEX IF NOT EXISTS permissions_code_unique ON permissions (code)",
    );
  },

  down: async (queryInterface) => {
    const { sequelize } = queryInterface;
    const now = new Date();

    // Revierte los renombres simples (reusando/creando la fila vieja). Las
    // exportaciones consolidadas no se pueden partir de vuelta: quedan con el
    // código `*:export`, que es el comportamiento aceptado al revertir.
    for (const [oldCode, newCode] of RENAMES) {
      const newId = await findIdByCode(sequelize, newCode);
      if (newId === null) continue;
      const oldId = await findIdByCode(sequelize, oldCode);
      if (oldId === null) {
        await sequelize.query(
          `UPDATE permissions SET code = :oldCode, "updatedAt" = :now WHERE id = :newId`,
          { replacements: { oldCode, now, newId } },
        );
      }
    }

    // Elimina los permisos que sólo existen en el catálogo nuevo.
    const addedOnly = [
      "users:delete",
      "profile:view",
      "profile:edit",
      "notifications:view",
      "notifications:edit",
      "notifications:delete",
      "vacations:request",
    ];
    await sequelize.query(
      `DELETE FROM role_permission
       WHERE "permissionId" IN (SELECT id FROM permissions WHERE code IN (:addedOnly))`,
      { replacements: { addedOnly } },
    );
    await sequelize.query("DELETE FROM permissions WHERE code IN (:addedOnly)", {
      replacements: { addedOnly },
    });
  },
};
