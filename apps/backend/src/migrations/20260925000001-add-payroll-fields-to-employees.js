"use strict";

// Tarifa por hora (para calcular el salario ordinario de la boleta quincenal)
// y saldo de vacaciones (asignación manual por empleado desde la app).
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("employees", "hourlyRate", {
      type: Sequelize.DECIMAL(12, 2),
      allowNull: true,
    });
    await queryInterface.addColumn("employees", "vacationDays", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("employees", "hourlyRate");
    await queryInterface.removeColumn("employees", "vacationDays");
  },
};
