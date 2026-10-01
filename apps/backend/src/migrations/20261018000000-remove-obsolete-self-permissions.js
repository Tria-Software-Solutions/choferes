"use strict";

/**
 * Limpia los permisos intermedios que se plantearon para el autoservicio del
 * expediente.
 *
 * Al final el autoservicio no necesita permisos propios: quien puede abrir su
 * "Mi Panel" (`my-panel:view`) puede mantener sus datos personales y pedir
 * cambios de licencia, y las solicitudes las revisa quien edita licencias
 * (`licenses:edit`). Así el empleado no depende de una migración de permisos
 * para ver sus acciones en el panel.
 *
 * Si una base llegó a tener esos permisos (de una versión previa de esta misma
 * migración), se borran para no dejar casillas inertes en Configuración → Roles.
 */

const OBSOLETE_CODES = ["employees:edit-own", "licenses:request", "licenses:review"];

module.exports = {
  async up(queryInterface) {
    const { sequelize } = queryInterface;

    await sequelize.transaction(async (transaction) => {
      await sequelize.query(
        `DELETE FROM role_permission
         WHERE "permissionId" IN (SELECT id FROM permissions WHERE code IN (:codes))`,
        { replacements: { codes: OBSOLETE_CODES }, transaction },
      );
      await sequelize.query("DELETE FROM permissions WHERE code IN (:codes)", {
        replacements: { codes: OBSOLETE_CODES },
        transaction,
      });
    });
  },

  async down() {
    // Se eliminaron por diseño: el autoservicio usa los permisos que ya existen.
  },
};
