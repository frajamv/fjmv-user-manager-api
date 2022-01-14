const Sequelize = require('sequelize');
const sql = require('../db/db.config');
const User = require('./user.model');

/**
 * Defines the model as the table 'user_loggings' in the database. The name has no 's' because it is automatically created with Sequelize.
 */
const User_logging = sql.define('user_logging', {
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
        defaultValue: Sequelize.fn('GETDATE')
    },
    Updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('GETDATE')
    },
    State: {
        type: Sequelize.ENUM('1', '0'),
        allowNull: false,
        defaultValue: '1'
    }
}, {
    timestamps: false
});

User.belongsToMany(User_logging)

module.exports = User_logging