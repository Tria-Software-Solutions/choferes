"use strict";

// Género del empleado ("Masculino" | "Femenino"). Controla la variante de
// algunos puestos (Cajero/Cajera, Supervisor/Supervisora) en la UI.
// Se agrega nullable para no romper registros existentes.
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("employees", "gender", {
      type: Sequelize.STRING(20),
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("employees", "gender");
  },
};