const Sequelize = require('sequelize')
const environment = require('../../environment');
const User_logging = require('../../models/user_logging.model');

module.exports = {
    up: async(queryInterface, Sequelize) => {
        await queryInterface.createTable('user_activity_logs', User_logging.getAttributes());
    },
    down: async(queryInterface, Sequelize) => {
        await queryInterface.dropTable('user_activity_logs');
    }
};