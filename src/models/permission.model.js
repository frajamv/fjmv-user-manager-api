const Sequelize = require("sequelize")
const sql = require('../db/db.config')
const env = require('../environment')
const Role = require("./role.model")

/**
 * Defines the model as the table 'roles' in the database. The name has no 's' because it is automatically created with Sequelize.
 */
const Permission = sql.define("permission", {
    Id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    Title: {
        type: Sequelize.ENUM('Users management', 'Roles management', 'System variables', 'Database monitoring', 'Basic usage', 'Root'),
        allowNull: false,
        defaultValue: 'Basic usage'
    },
    Details: {
        type: Sequelize.STRING,
        allowNull: true
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
    }
}, {
    timestamps: false
});

module.exports = Permission