"use strict";

// Página de Documentos: además de los ámbitos compartido (global) y por empleado,
// los usuarios de gestión (Gerencia/Administrativo/SysAdmin) pueden tener su
// propio ámbito "Solo para mí". Ese ámbito no depende de una ficha de Planilla,
// así que se identifica por el usuario dueño (`ownerUserId`) en vez del empleado.
// Exactamente uno de `ownerEmployeeId` / `ownerUserId` está definido; ambos null
// = carpeta/archivo compartido.
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("document_folders", "ownerUserId", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: "users", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });
    await queryInterface.addIndex("document_folders", ["ownerUserId"], {
      name: "document_folders_owner_user_id",
    });

    await queryInterface.addColumn("documents", "ownerUserId", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: "users", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });
    await queryInterface.addIndex("documents", ["ownerUserId"], {
      name: "documents_owner_user_id",
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex("documents", "documents_owner_user_id");
    await queryInterface.removeColumn("documents", "ownerUserId");

    await queryInterface.removeIndex("document_folders", "document_folders_owner_user_id");
    await queryInterface.removeColumn("document_folders", "ownerUserId");
  },
};
