"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("notifications", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
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
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      type: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "info",
      },
      category: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "system",
      },
      priority: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "medium",
      },
      read: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      actionUrl: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      actionText: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      source: {
        type: Sequelize.STRING,
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

    await queryInterface.addIndex("notifications", ["userId"], {
      name: "notifications_user_id",
    });
    // Unique (userId, source) prevents duplicate payment reminders
    await queryInterface.addIndex("notifications", ["userId", "source"], {
      name: "notifications_user_id_source",
      unique: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("notifications");
  },
};
