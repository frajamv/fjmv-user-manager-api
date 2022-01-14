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
    port: env.port || env[env_prefix + '_port'],
    DB_HOST: env[env_prefix + '_dbhost'],
    DB_USERNAME: env[env_prefix + '_dbusername'],
    DB_PASSWORD: env[env_prefix + '_dbpassword'],
    DB_NAME: env[env_prefix + '_dbname'],
    JWT_KEY: env[env_prefix + '_jwtkey']
}

env.db_current_date = () => {
    switch (env.CURRENT_DBMS) {
        case 'mysql':
            return 'NOW'
        case 'mssql':
            return 'GETDATE'
    }
}

/**
 * Export all the environment variables to system through dotenv.
 */
module.exports = env;