'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.renameTable('userRoles', 'user_role');
    await queryInterface.renameTable('rolePermissions', 'role_permission');
  },

  down: async (queryInterface) => {
    await queryInterface.renameTable('user_role', 'userRoles');
    await queryInterface.renameTable('role_permission', 'rolePermissions');
  },
};
