'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable("schedule");

    await queryInterface.addColumn("schedule", "days", {
      type: Sequelize.ARRAY(Sequelize.STRING),
      allowNull: true, 
    });

    if (tableInfo.day) {
      await queryInterface.sequelize.query(`
        UPDATE "schedule" 
        SET "days" = ARRAY["day"] 
        WHERE "day" IS NOT NULL;
      `);

      await queryInterface.removeColumn("schedule", "day");
    }

    await queryInterface.changeColumn("schedule", "days", {
      type: Sequelize.ARRAY(Sequelize.STRING),
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn("schedule", "day", {
      type: Sequelize.STRING,
      allowNull: false,
    });

    await queryInterface.sequelize.query(`
      UPDATE "schedule" 
      SET "day" = "days"[1] 
      WHERE "days" IS NOT NULL AND array_length("days", 1) > 0;
    `);

    await queryInterface.removeColumn("schedule", "days");
  },
};
