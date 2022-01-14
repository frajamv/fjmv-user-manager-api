const Sequelize = require("sequelize")
const sql = require('../db/db.config')
const env = require('../environment')

/**
 * Defines the model as the table 'users' in the database. The name has no 's' because it is automatically created with Sequelize.
 */
const User = sql.define("user", {
    Id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    Full_name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    National_identifier: {
        type: Sequelize.STRING,
        allowNull: false
    },
    DOB: {
        type: Sequelize.DATEONLY,
        allowNull: false
    },
    Username: {
        type: Sequelize.STRING,
        allowNull: false
    },
    Password: {
        type: Sequelize.STRING,
        allowNull: false
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

module.exports = User