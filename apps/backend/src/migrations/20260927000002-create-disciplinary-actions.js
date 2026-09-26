"use strict";

// Llamadas de atención / amonestaciones por empleado. Los adjuntos (documentos
// e imágenes) se guardan como data URLs base64 en un arreglo JSONB para evitar
// el filesystem efímero de producción (mismo criterio que los avatares).
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("disciplinary_actions", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      employeeId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "employees", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      actionDate: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      type: {
        type: Sequelize.STRING(30),
        allowNull: false,
      },
      severity: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: "leve",
      },
      reason: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      attachments: {
        type: Sequelize.JSONB,
        allowNull: true,
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

    await queryInterface.addIndex("disciplinary_actions", ["employeeId"], {
      name: "disciplinary_actions_employee_id",
    });
    await queryInterface.addIndex("disciplinary_actions", ["actionDate"], {
      name: "disciplinary_actions_action_date",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("disciplinary_actions");
  },
};
