"use strict";

// Quincenas de pago: una fila por empleado + quincena (biweekNumber 1-24) + año.
// Los montos se calculan en el servidor (horas de la quincena × hourlyRate) pero
// son editables a mano; isManual marca que un recálculo no debe pisar ediciones.
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("payments", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      employeeId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "employees",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      payPeriod: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: "biweekly",
      },
      biweekNumber: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      year: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      payDate: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      currency: {
        type: Sequelize.STRING(3),
        allowNull: false,
        defaultValue: "CRC",
      },
      regularSalary: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
      },
      overtimePay: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
      },
      mileage: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
      },
      others: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
      },
      socialCharges: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
      },
      deductions: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
      },
      totalPayable: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      status: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: "pending",
      },
      emailSentAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      isManual: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.addIndex("payments", ["employeeId"], {
      name: "payments_employee_id",
    });

    // Índice único parcial: solo aplica a quincenas (payPeriod='biweekly'),
    // permitiendo otros periodos en el futuro sin chocar con esta restricción.
    await queryInterface.sequelize.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "payments_biweekly_employee_biweek_year_unique"
        ON payments ("employeeId", "biweekNumber", "year")
        WHERE "payPeriod" = 'biweekly'
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`
      DROP INDEX IF EXISTS "payments_biweekly_employee_biweek_year_unique"
    `);
    await queryInterface.dropTable("payments");
  },
};
