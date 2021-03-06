const Sequelize = require('sequelize')
const sql = require('../db/db.config')
const env = require('../environment')
const User = require('./user.model')

/**
 * Defines the model as the table 'user_loggings' in the database. The name has no 's' because it is automatically created with Sequelize.
 */
const User_logging = sql.define('user_activity_log', {
    Id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
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
        defaultValue: Sequelize.fn(env.db_current_date())
    },
    Updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn(env.db_current_date())
    },
    State: {
        type: Sequelize.ENUM('1', '0'),
        allowNull: false,
        defaultValue: '1'
    }
}, {
    timestamps: false
});

User_logging.belongsTo(User)

module.exports = User_logging