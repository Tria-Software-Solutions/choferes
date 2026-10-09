"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // One row per refresh-token session. Enables server-side rotation,
    // reuse detection and logout revocation (a JWT alone cannot be revoked).
    await queryInterface.createTable("auth_sessions", {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      refreshJti: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      previousJti: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      rotatedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      expiresAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      revokedAt: {
        type: Sequelize.DATE,
        allowNull: true,
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

    await queryInterface.addIndex("auth_sessions", ["userId"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("auth_sessions");
  },
};
