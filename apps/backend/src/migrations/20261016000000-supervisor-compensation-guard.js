"use strict";

/**
 * Deja como regla permanente que el Supervisor no administra la compensación ni
 * ve el salario de nadie, y se le asegura aunque alguien lo haya concedido desde
 * Configuración → Roles.
 *
 * El filtro por permiso de `employeeService` ya evita que los datos salgan en la
 * respuesta, pero se apoya en que el permiso no esté en la base. El editor de
 * Roles escribe directo en `role_permission` y ninguna migración lo vuelve a
 * normalizar, así que una edición en vivo podría devolverle al Supervisor el
 * acceso a la compensación y al listado de empleados.
 *
 * Antes: dependía del seed y de una revocación puntual (20261010000000).
 * Ahora: los permisos que abren datos de otros son exclusivos de SysAdmin,
 * Gerencia y Administrativo, y esta migración falla ruidosamente si el rol no
 * existe, para no dejar un sistema medio configurado en silencio.
 */

// `employees:view` abre la ficha y el listado de empleados; `payments:view` y
// `vacations:view` abren el salario y el saldo de vacaciones de terceros.
const SUPERVISOR_FORBIDDEN_CODES = [
  "employees:view",
  "payments:view",
  "vacations:view",
];

// Los tres roles que sí administran a los demás, según DEFAULT_ROLE_PERMISSIONS
// (packages/shared). Se les asegura el permiso aquí porque `up` también sirve
// como red de seguridad si una edición en vivo se los quitó.
const MANAGEMENT_ROLE_NAMES = ["SysAdmin", "Gerencia", "Administrativo"];

const insertPermission = async (queryInterface, roleName, code, now, transaction) => {
  await queryInterface.sequelize.query(
    `INSERT INTO role_permission ("roleId", "permissionId", "createdAt", "updatedAt")
     SELECT r.id, p.id, :now, :now
     FROM roles r CROSS JOIN permissions p
     WHERE r.name = :roleName AND p.code = :code
       AND NOT EXISTS (
         SELECT 1 FROM role_permission rp
         WHERE rp."roleId" = r.id AND rp."permissionId" = p.id
       )`,
    { replacements: { roleName, code, now }, transaction },
  );
};

module.exports = {
  async up(queryInterface) {
    const { sequelize } = queryInterface;

    await sequelize.transaction(async (transaction) => {
      const [{ roleCount }] = await sequelize.query(
        `SELECT COUNT(*)::int AS "roleCount" FROM roles WHERE name = 'Supervisor'`,
        { transaction, type: sequelize.QueryTypes.SELECT },
      );
      if (Number(roleCount) === 0) {
        throw new Error("Rol 'Supervisor' no encontrado. Configuración incorrecta.");
      }

      // Los roles de gestión deben poder ver la compensación de los demás. Se
      // reponen aquí, dentro de la misma transacción, en lugar de asumir que el
      // seed está intacto: si a alguno le faltara uno, el filtro de
      // `employeeService` le ocultaría el dato sin avisar.
      const now = new Date();
      for (const roleName of MANAGEMENT_ROLE_NAMES) {
        await insertPermission(queryInterface, roleName, "employees:view", now, transaction);
        await insertPermission(queryInterface, roleName, "payments:view", now, transaction);
        await insertPermission(queryInterface, roleName, "vacations:view", now, transaction);
      }

      // Revoca a Supervisor lo que el seed no le da o lo que se le haya
      // concedido en vivo.
      await sequelize.query(
        `DELETE FROM role_permission
         WHERE "roleId" IN (SELECT id FROM roles WHERE name = 'Supervisor')
           AND "permissionId" IN (
             SELECT id FROM permissions WHERE code IN (:codes)
           )`,
        { replacements: { codes: SUPERVISOR_FORBIDDEN_CODES }, transaction },
      );
    });
  },

  async down(queryInterface) {
    // No se deshace: devolverle a Supervisor `employees:view` reabriría la página
    // de Empleados y el salario volvería a ser visible para él. Si llegó a
    // otorgarse, la forma correcta de revertir es editar el rol desde
    // Configuración → Roles. `down` queda vacío a propósito para que un rollback
    // no debilite el control.
  },
};
