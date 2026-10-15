"use strict";

// Compartición explícita de archivos con personas concretas (empleados o
// usuarios de gestión) y un nivel de permiso (ver/comentar/editar). Un archivo
// puede compartirse con varias personas y una persona puede recibir varios
// archivos: es una relación muchos-a-muchos. El dueño del ámbito del documento
// no cambia; estas filas solo conceden acceso adicional.
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("document_shares", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      documentId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "documents", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      employeeId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: "employees", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: "users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      permission: {
        type: Sequelize.STRING(16),
        allowNull: false,
        defaultValue: "view",
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

    await queryInterface.addIndex("document_shares", ["documentId"], {
      name: "document_shares_document_id",
    });
    await queryInterface.addIndex("document_shares", ["employeeId"], {
      name: "document_shares_employee_id",
    });
    await queryInterface.addIndex("document_shares", ["userId"], {
      name: "document_shares_user_id",
    });

    // Un destinatario no se repite por documento. Se usan índices parciales
    // porque Postgres trata los NULL como distintos en un unique normal.
    await queryInterface.sequelize.query(
      `CREATE UNIQUE INDEX document_shares_doc_employee_unique
         ON document_shares ("documentId", "employeeId") WHERE "employeeId" IS NOT NULL`,
    );
    await queryInterface.sequelize.query(
      `CREATE UNIQUE INDEX document_shares_doc_user_unique
         ON document_shares ("documentId", "userId") WHERE "userId" IS NOT NULL`,
    );

    // Exactamente un destinatario por fila.
    await queryInterface.sequelize.query(
      `ALTER TABLE document_shares ADD CONSTRAINT document_shares_one_recipient
         CHECK ((("employeeId" IS NOT NULL)::int + ("userId" IS NOT NULL)::int) = 1)`,
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable("document_shares");
  },
};
