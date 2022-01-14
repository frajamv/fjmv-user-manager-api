const Sequelize = require("sequelize");
const sql = require('../db/db.config')

/**
 * Defines the model as the table 'table_tests' in the database. The name has no 's' because it is automatically created with Sequelize.
 */
const Table_test = sql.define("table_test", {
    Id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    Name: {
        type: Sequelize.STRING
    }
}, {
    timestamps: false
});

module.exports = Table_test