"use strict";

// Página de Documentos: carpetas (globales o de un empleado) y los archivos que
// guardan, con el binario como data URL base64 (igual que los adjuntos de
// amonestaciones). `ownerEmployeeId` null = ámbito compartido/global.
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("document_folders", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING(120),
        allowNull: false,
      },
      parentId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: "document_folders", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      ownerEmployeeId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: "employees", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      createdBy: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: "users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addIndex("document_folders", ["parentId"], {
      name: "document_folders_parent_id",
    });
    await queryInterface.addIndex("document_folders", ["ownerEmployeeId"], {
      name: "document_folders_owner_employee_id",
    });

    await queryInterface.createTable("documents", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      folderId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: "document_folders", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      ownerEmployeeId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: "employees", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      name: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      mimeType: {
        type: Sequelize.STRING(120),
        allowNull: true,
      },
      size: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      data: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      uploadedBy: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: "users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addIndex("documents", ["folderId"], {
      name: "documents_folder_id",
    });
    await queryInterface.addIndex("documents", ["ownerEmployeeId"], {
      name: "documents_owner_employee_id",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("documents");
    await queryInterface.dropTable("document_folders");
  },
};
