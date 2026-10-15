"use strict";

// Los binarios de Documentos dejan de vivir en Postgres (data URL base64) y pasan
// a un bucket S3-compatible: la fila guarda la clave (`storageKey`, proveedor en
// `storageProvider`) y una `revision` que sube en cada guardado del editor.
//
// `data` se vuelve nullable para no duplicar el contenido: los archivos antiguos
// lo conservan y los nuevos lo dejan vacío. La revisiones de ONLYOFFICE cambian la
// clave del documento en el editor, y aquí también (`storageKey` nueva) para no
// servir una versión cacheada.
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("documents", "storageKey", {
      type: Sequelize.STRING(512),
      allowNull: true,
    });
    await queryInterface.addColumn("documents", "storageProvider", {
      type: Sequelize.STRING(32),
      allowNull: true,
    });
    await queryInterface.addColumn("documents", "revision", {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1,
    });
    await queryInterface.changeColumn("documents", "data", {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("documents", "revision");
    await queryInterface.removeColumn("documents", "storageProvider");
    await queryInterface.removeColumn("documents", "storageKey");
    await queryInterface.changeColumn("documents", "data", {
      type: Sequelize.TEXT,
      allowNull: false,
    });
  },
};
