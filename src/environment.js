require('dotenv').config();
/**
 * Get all the .env file data.
 */
let env = process.env

/**
 * Sets the current environment prefix to fetch the .ENV properties depending on it. e.g: DEV_HOST, QA_HOST, PRD_HOST.
 */
const env_prefix = ['DEV', 'QA', 'PRD'].includes(env.current_environment) ? env.current_environment : 'DEV'

/**
 * Set global port properties for the environment depending on prefix.
 * e.g: DEV_DB_PORT, DEV_DB_HOST, DEV_DB_USERNAME will be set as global variables without prefix.
 */
env = {
    ...env,
    port: env.port || env[env_prefix + '_PORT'],
    DB_HOST: env[env_prefix + '_DBHOST'],
    DB_USERNAME: env[env_prefix + '_DBUSERNAME'],
    DB_PASSWORD: env[env_prefix + '_DBPASSWORD'],
    DB_NAME: env[env_prefix + '_DBNAME'],
    JWT_KEY: env[env_prefix + '_JWTKEY']
}

console.log(`Current environment: ${env_prefix}.`)

env.db_current_date = () => {
    switch (env.CURRENT_DBMS) {
        case 'mysql':
            return 'NOW'
        case 'mssql':
            return 'GETDATE'
        default:
            return 'NOW'
    }
}

/**
 * Export all the environment variables to system through dotenv.
 */
module.exports = env;