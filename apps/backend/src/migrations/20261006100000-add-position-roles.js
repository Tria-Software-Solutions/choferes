"use strict";

/**
 * Un rol de acceso por puesto: "Chofer", "Chofer Coordinador" y "Recepcionista"
 * (el de Supervisor ya existe). Arrancan con los permisos de autoservicio (Mi
 * Panel y Tareas) y se ajustan desde Configuración → Roles.
 *
 * También alinea las cuentas ya vinculadas a un empleado: cada una pasa al rol de
 * su puesto (un supervisor queda con el rol Supervisor; sin puesto, "Usuario").
 * Solo se tocan cuentas cuyos roles son "operativos"; Gerencia, Administrativo y
 * cualquier rol personalizado se respetan tal cual.
 *
 * Todo se busca por nombre/código (nunca por id), así que es idempotente.
 */

const NEW_ROLES = ["Chofer Coordinador", "Recepcionista", "Chofer"];
const SELF_SERVICE_CODES = [
  "dashboard:self:view",
  "tasks:view",
  "tasks:create",
  "tasks:edit",
  "tasks:delete",
];
// Roles que siguen al puesto (ver POSITION_LINKED_ROLE_NAMES en @choferes/shared).
const POSITION_LINKED_ROLES = ["Usuario", "Chofer", "Chofer Coordinador", "Recepcionista", "Supervisor"];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const { sequelize } = queryInterface;
    const now = new Date();

    await sequelize.transaction(async (transaction) => {
      for (const name of NEW_ROLES) {
        await sequelize.query(
          `INSERT INTO roles (name, "createdAt", "updatedAt")
           SELECT :name, :now, :now
           WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = :name)`,
          { replacements: { name, now }, transaction },
        );
      }

      await sequelize.query(
        `INSERT INTO role_permission ("roleId", "permissionId", "createdAt", "updatedAt")
         SELECT r.id, p.id, :now, :now
         FROM roles r CROSS JOIN permissions p
         WHERE r.name IN (:roles) AND p.code IN (:codes)
           AND NOT EXISTS (
             SELECT 1 FROM role_permission rp
             WHERE rp."roleId" = r.id AND rp."permissionId" = p.id
           )`,
        { replacements: { roles: NEW_ROLES, codes: SELF_SERVICE_CODES, now }, transaction },
      );

      // Cuentas vinculadas a un empleado cuyos roles son todos operativos (o
      // ninguno) y que no tienen ya exactamente el rol de su puesto.
      const targets = `
        SELECT u.id AS "userId", r.id AS "roleId"
        FROM users u
        JOIN employees e ON e.id = u."employeeId"
        JOIN roles r ON r.name = CASE e.position
          WHEN 'chofer' THEN 'Chofer'
          WHEN 'chofer_coordinador' THEN 'Chofer Coordinador'
          WHEN 'recepcionista' THEN 'Recepcionista'
          WHEN 'supervisor' THEN 'Supervisor'
          ELSE 'Usuario'
        END
        WHERE u."employeeId" IS NOT NULL
          AND NOT EXISTS (
            SELECT 1 FROM user_role ur
            JOIN roles rr ON rr.id = ur."roleId"
            WHERE ur."userId" = u.id AND rr.name NOT IN (:linked)
          )
          AND NOT (
            (SELECT COUNT(*) FROM user_role ur2 WHERE ur2."userId" = u.id) = 1
            AND EXISTS (SELECT 1 FROM user_role ur3 WHERE ur3."userId" = u.id AND ur3."roleId" = r.id)
          )`;

      await sequelize.query(
        `CREATE TEMP TABLE position_role_targets ON COMMIT DROP AS ${targets}`,
        { replacements: { linked: POSITION_LINKED_ROLES }, transaction },
      );
      await sequelize.query(
        `DELETE FROM user_role WHERE "userId" IN (SELECT "userId" FROM position_role_targets)`,
        { transaction },
      );
      await sequelize.query(
        `INSERT INTO user_role ("userId", "roleId", "createdAt", "updatedAt")
         SELECT "userId", "roleId", :now, :now FROM position_role_targets`,
        { replacements: { now }, transaction },
      );
    });
  },

  async down(queryInterface) {
    const { sequelize } = queryInterface;

    await sequelize.transaction(async (transaction) => {
      // Las cuentas de los roles que desaparecen vuelven al rol genérico.
      await sequelize.query(
        `UPDATE user_role
         SET "roleId" = (SELECT id FROM roles WHERE name = 'Usuario')
         WHERE "roleId" IN (SELECT id FROM roles WHERE name IN (:roles))
           AND EXISTS (SELECT 1 FROM roles WHERE name = 'Usuario')`,
        { replacements: { roles: NEW_ROLES }, transaction },
      );
      await sequelize.query(
        `DELETE FROM role_permission WHERE "roleId" IN (SELECT id FROM roles WHERE name IN (:roles))`,
        { replacements: { roles: NEW_ROLES }, transaction },
      );
      await sequelize.query(`DELETE FROM roles WHERE name IN (:roles)`, {
        replacements: { roles: NEW_ROLES },
        transaction,
      });
    });
  },
};
