const Sequelize = require("sequelize")
const environment = require("../../environment")

const schema = {
    Id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    User_id: {
        type: Sequelize.INTEGER
    },
    Action_performed: {
        type: Sequelize.ENUM('Register', 'Login', 'Activate', 'Deactivate', 'Role'),
        allowNull: false
    },
    Description: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'No description provided.'
    },
    Created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn(environment.db_current_date())
    },
    Updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn(environment.db_current_date())
    },
    State: {
        type: Sequelize.ENUM('1', '0'),
        allowNull: false,
        defaultValue: '1'
    }
}

module.exports = {
    up: async(queryInterface, Sequelize) => {
        await queryInterface.createTable('users', schema);
    },
    down: async(queryInterface, Sequelize) => {
        await queryInterface.dropTable('users');
    }
};