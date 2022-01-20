const Sequelize = require("sequelize")
const sql = require('../db/db.config')
const env = require('../environment');
const Permission = require("./permission.model");
const Role = require("./role.model")

/**
 * Defines the model as the table 'roles' in the database. The name has no 's' because it is automatically created with Sequelize.
 */
const Role_permission = sql.define("role_permission", {
    Id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
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

Permission.belongsToMany(Role, { through: Role_permission })
Role.belongsToMany(Permission, { through: Role_permission })

module.exports = Role_permission