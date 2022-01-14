const Sequelize = require("sequelize")
const sql = require('../db/db.config')
const env = require('../environment')
const Role = require("./role.model")
const User = require("./user.model")

/**
 * Defines the model as the table 'roles' in the database. The name has no 's' because it is automatically created with Sequelize.
 */
const User_role = sql.define("user_role", {
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

User.belongsToMany(Role, { through: User_role })
Role.belongsToMany(User, { through: User_role })

module.exports = User_role