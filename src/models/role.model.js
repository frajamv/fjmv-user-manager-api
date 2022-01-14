const Sequelize = require("sequelize");
const sql = require('../db/db.config');

/**
 * Defines the model as the table 'roles' in the database. The name has no 's' because it is automatically created with Sequelize.
 */
const Role = sql.define("role", {
    Id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    Description: {
        type: Sequelize.STRING,
        allowNull: false
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
    }
}, {
    timestamps: false
});


module.exports = Role