// Connection to MS SQL Server
const { Sequelize } = require('sequelize')
const environment = require('../environment')

const dbms = 'mssql'

/**
 * Initialize the MS SQL connection.
 */
const sql = new Sequelize(environment.DB_NAME, environment.DB_USERNAME, environment.DB_PASSWORD, {
    host: environment.DB_HOST,
    dialect: dbms,
    logging: false
})

/**
 * Test the connection to the database (Deprecated).
 */
const test_connection = async() => {
    try {
        await sql.authenticate();
        console.log('Connection established with', dbms)
    } catch (error) {
        console.log('Unable to connect to ', dbms + ':', error)
    }
}

/**
 * Synchronize all the models (models folder) to the SQL tables by dropping and re-creating them (Only usable when migrating because of data loss).
 */
sync = () => {
    sql.sync({ force: true }).then((value) => {
        console.log("Successfully connected to", value.options.dialect)
        console.log("All data has been restored.")
    })
};
// sync();

/**
 * Export SQL connection.
 */
module.exports = sql