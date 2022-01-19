const { parseSuccess, parseSuccessOK, parseError, parseSQLData } = require('../utils/parser.utils')
const env = require('../environment')
const { Op } = require('sequelize')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt');
const salt_rounds = 10;
const User = require('../models/user.model')
const User_role = require('../models/user_role.model')
const Role = require('../models/role.model');
const User_logging = require('../models/user_logging.model');

/**
 * Module controller that resolves all the user requests.
 */
controller = {}

/**
 * Returns all rows from 'user' table in MS SQL Server database.
 * @param {*} req HTTP request
 * @param {*} res HTTP response
 */
controller.getAllRoles = async(req, res) => {
    try {
        const found = await Role.findAll()
        data = parseSQLData(found)
        return parseSuccessOK(res, data)
    } catch (error) {
        console.log("Error:", error)
        return parseError(res, 500, error)
    }
}

/**
 * Creates a new row for the table 'users'.
 * @param {*} req HTTP request
 * @param {*} res HTTP response
 */
controller.assignRoleToUser = async(req, res) => {
    try {
        payload = {
            userId: req.body.userId,
            roleId: req.body.roleId
        }

        if (!payload.userId || !payload.roleId)
            return parseError(res, 400, 'Please select a user and a role.')

        const addition = await User_role.create(payload)
        if (addition && addition.Id) {
            _createUserLog('Role', payload.userId)
            return parseSuccess(res, 201, { message: 'User role successfully assigned.' })
        }
        return parseError(res, 304, 'No changes were made.')
    } catch (error) {
        return parseError(res, 500, error)
    }
}

/**
 * Creates a new row for the table 'users'.
 * @param {*} req HTTP request
 * @param {*} res HTTP response
 */
controller.setUserRoles = async(req, res) => {
    try {
        payload = {
            userId: req.body.userId,
            roles: req.body.roles
        }

        if (!payload.userId || !payload.roles)
            return parseError(res, 400, 'Please select a user and the roles to set.')

        const deletion = await User_role.destroy({
            where: {
                userId: payload.userId
            }
        })
        if (!deletion) {
            return parseError(res, 304, 'Could not remove the current roles.')
        }

        const found_roles = await Role.findAll({
            where: {
                Description: payload.roles
            }
        });
        if (!found_roles) return parseError(res, 304, 'Roles not found.')

        const role_ids = found_roles.map(r => {
            return {
                roleId: r.Id,
                userId: payload.userId
            }
        })
        const role_assignments = await User_role.bulkCreate(role_ids)
        if (role_assignments) {
            _createDetailedUserLog('Role', `Roles ${payload.roles.join(', ')} assigned to user.`, payload.userId)
            return parseSuccessOK(res, 'All roles were assigned to user.')
        }

        return parseError(res, 400, 'Roles not assigned')
    } catch (error) {
        return parseError(res, 500, error)
    }
}

/**
 * Deletes a row from 'user' table in MS SQL Server database that has the id provided.
 * @param {*} req HTTP request
 * @param {*} res HTTP response
 */
controller.deassignRoleToUser = async(req, res) => {
    try {
        payload = {
            userId: req.body.userId,
            roleId: req.body.roleId
        }

        if (!payload.userId || !payload.roleId)
            return parseError(res, 400, 'Please select a user and a role.')

        const deletion = await User_role.destroy({
            where: {
                userId: payload.userId,
                roleId: payload.roleId
            }
        })
        if (deletion) {
            _createUserLog('Role', payload.userId)
            return parseSuccess(res, 201, { message: 'User role successfully deassigned.' })
        }
        return parseError(res, 304, 'No changes were made.')
    } catch (error) {
        console.log("Error:", error)
        return parseError(res, 500, error)
    }
}

/**
 * Returns all rows from 'user' table in MS SQL Server database.
 * @param {*} req HTTP request
 * @param {*} res HTTP response
 */
controller.getAllUsers = async(req, res) => {
    try {
        const role_filters = req.body.roles
        const found = await User.findAll({
            attributes: {
                exclude: ['Password'] // Don't return user password.
            },
            include: { // Bring related 'roles' rows.
                model: Role,
                attributes: ['Id', 'Description'], // Only need the role 'Description' field.
            }
        })

        // Obligatory: Convert Sequelize data to JSON object when having to treat some attributes as below.
        data = parseSQLData(found)

        if (role_filters)
            data = data.filter(user => user.roles.some(role => role_filters.includes(role.Description)))
        for (const user of data) {
            const roles = user.roles
            user.roles = roles.map(r => r.Description)
            user.roles_array = roles.map(r => { return { Description: r.Description, Id: r.Id } })
        }

        return parseSuccessOK(res, data)
    } catch (error) {
        console.log("Error:", error)
        return parseError(res, 500, error)
    }
}

/**
 * Returns all rows from 'user' table in MS SQL Server database.
 * @param {*} req HTTP request
 * @param {*} res HTTP response
 */
controller.getOneUser = async(req, res) => {
    try {
        const userId = req.params.id
        const found = await User.findByPk(userId, {
            attributes: {
                exclude: ['Password'] // Don't return user password.
            },
            include: { // Bring related 'roles' rows.
                model: Role,
                attributes: ['Id', 'Description'], // Only need the role 'Description' field.
            }
        })

        // Obligatory: Convert Sequelize data to JSON object when having to treat some attributes as below.
        user = parseSQLData(found)

        const roles = user.roles
        user.roles = roles.map(r => r.Description)
        user.roles_array = roles.map(r => { return { Description: r.Description, Id: r.Id } })

        return parseSuccessOK(res, user)
    } catch (error) {
        console.log("Error:", error)
        return parseError(res, 500, error)
    }
}

/**
 * Deletes a row from 'user' table in MS SQL Server database that has the id provided.
 * @param {*} req HTTP request
 * @param {*} res HTTP response
 */
controller.deleteUser = async(req, res) => {
    try {
        const id = req.params.id
        const deleted = await User.destroy({
            where: {
                Id: id
            }
        })

        if (!deleted)
            return parseError(res, 500, 'No changes were made.')

        return parseSuccessOK(res, { message: 'User deleted.', data: deleted })
    } catch (error) {
        console.log("Error:", error)
        return parseError(res, 500, error)
    }
}

/**
 * Returns all rows from 'user_activity_logs' table in MS SQL Server database.
 * @param {*} req HTTP request
 * @param {*} res HTTP response
 */
controller.getUserLogs = async(req, res) => {
    try {
        const found = await User_logging.findAll({
            attributes: {
                exclude: ['Password'] // Don't return user password.
            },
            include: { // Bring related 'users' rows.
                model: User,
                include: { // Bring related 'roles' rows.
                    model: Role,
                    attributes: ['Description'], // Only need the role 'Description' field.
                },
                attributes: {
                    exclude: ['Password']
                }, // Only need the role 'Description' field.
            }
        })

        // Obligatory: Convert Sequelize data to JSON object when having to treat some attributes as below.
        data = parseSQLData(found)
        for (const log of data) {
            if (log.user && log.user.roles) log.user.roles = log.user.roles.map(r => r.Description)
        }

        return parseSuccessOK(res, data)
    } catch (error) {
        console.log("Error:", error)
        return parseError(res, 500, error)
    }
}

/**
 * Returns all rows from 'user_activity_logs' table in MS SQL Server database.
 * @param {*} req HTTP request
 * @param {*} res HTTP response
 */
controller.getSingleUserLogs = async(req, res) => {
    try {
        const id = req.params.id;
        const found = await User_logging.findAll({
            where: {
                userId: id
            },
            attributes: {
                exclude: ['Password'] // Don't return user password.
            },
            include: { // Bring related 'users' rows.
                model: User,
                include: { // Bring related 'roles' rows.
                    model: Role,
                    attributes: ['Description'], // Only need the role 'Description' field.
                },
                attributes: {
                    exclude: ['Password']
                }, // Only need the role 'Description' field.
            }
        })

        // Obligatory: Convert Sequelize data to JSON object when having to treat some attributes as below.
        data = parseSQLData(found)
        for (const log of data) {
            if (log.user && log.user.roles) log.user.roles = log.user.roles.map(r => r.Description)
        }

        return parseSuccessOK(res, data)
    } catch (error) {
        console.log("Error:", error)
        return parseError(res, 500, error)
    }
}

/**
 * Creates a new row for the table 'users'.
 * @param {*} req HTTP request
 * @param {*} res HTTP response
 */
controller.registerUser = async(req, res) => {
    try {
        payload = {
            Full_name: req.body.Full_name,
            National_identifier: req.body.National_identifier,
            DOB: req.body.DOB,
            Username: req.body.Username,
            Password: req.body.Password
        }

        if (!payload.Full_name || !payload.National_identifier || !payload.DOB || !payload.Username || !payload.Password)
            return parseError(res, 400, 'Please insert all fields for the new user.')

        const hashed_password = await _generateHashedPassword(payload.Password)
        payload.Password = hashed_password

        const addition = await User.create(payload)
        if (addition && addition.Id) {
            _createUserLog('Register', addition.Id)
            return parseSuccess(res, 201, { message: 'User successfully created.' })
        }
        return parseError(res, 304, 'No changes were made.')
    } catch (error) {
        return parseError(res, 500, error)
    }
}

/**
 * Verifies if the credentials passed in the body match correctly with a registered user in the DB.
 * @param {*} req HTTP request
 * @param {*} res HTTP response
 */
controller.authenticate = async(req, res) => {
    try {
        const credentials = {
            Username: req.body.Username,
            Password: req.body.Password
        }

        if (!credentials.Username || !credentials.Password)
            return parseError(res, 400, 'Provide Username and Password for authentication.')

        const found = await User.findAll({
            where: {
                Username: credentials.Username,
                State: 1
            }
        })

        // As SQL Server Collation is case insensitive, username 'Abc' is equal to 'abc'. So the case
        // must be compared through JS for username.
        if (!found[0] || found[0].Username !== credentials.Username)
            return parseError(res, 404, `The username ${credentials.Username} is not registered.`)

        const correct_password = await _comparePasswords(credentials.Password, found[0].Password)
        if (correct_password) {
            delete found[0].Password
            const token = jwt.sign({
                    ...found[0]
                },
                env.JWT_KEY, {
                    expiresIn: '300s',
                }
            );
            const payload = {
                status: 'OK',
                token: token
            }

            _createUserLog('Login', found[0].Id)
            return parseSuccessOK(res, payload)
        }

        return parseError(res, 400, "Wrong password.")
    } catch (error) {
        console.log(error)
        return parseError(res, 500, error)
    }
}

/**
 * Fills the SQL database with users, roles and users_roles in order to have test data to treat.
 * @param {*} req HTTP request
 * @param {*} res HTTP response
 * @returns 
 */
controller.fillTestUsers = async(req, res) => {
    try {
        const test_users = [{
                Full_name: 'Francisco Javier Martínez Vargas',
                National_identifier: '1107522102',
                DOB: '1998-01-27',
                Username: 'frajam',
                Password: 'Qlonas4thewin123',
                Roles: [
                    'Sysadmin', 'Admin'
                ]
            },
            {
                Full_name: 'Jhoan David Ramírez Grajales',
                National_identifier: '1105490379',
                DOB: '1995-12-20',
                Username: 'jhowalk',
                Password: 'Megustanfeas',
                Roles: [
                    'Superuser', 'User', 'Admin'
                ]
            }
        ]
        if (req.body.custom_payload) test_users = req.body.custom_payload

        const test_roles = [
            { Description: "Sysadmin" },
            { Description: "Admin" },
            { Description: "Superuser" },
            { Description: "User" },
            { Description: "Root" }
        ]
        if (req.body.custom_roles) test_roles = req.body.custom_roles

        const inconsistent_data = req.body.test_users && test_users.some(user => !test_roles.includes(user.Roles))
        if (inconsistent_data) return parseError(res, 400, 'Please fill corresponding roles to users according to request body.')

        const roles_addition = Role.bulkCreate(test_roles)
        if (!roles_addition) return parseError(res, 304, `No changes were made trying to add the roles ${test_roles.map(r => r.Description).join(', ')}.`)

        for (const payload of test_users) {
            const hashed_password = await _generateHashedPassword(payload.Password)
            payload.Password = hashed_password

            const roles = payload.Roles
            delete payload.roles
            const user_addition = await User.create(payload)
            if (!user_addition) return parseError(res, 304, `No changes were made trying to add the user ${payload.Full_name}.`)

            for (const role of roles) {
                const found_role = await Role.findAll({ where: { Description: role } })
                if (!found_role[0]) return parseError(res, 404, `No role named ${role} was found.`)

                const role_assignation = await User_role.create({ userId: user_addition.Id, roleId: found_role[0].Id })
                if (!role_assignation) return parseError(res, 304, `No changes were made trying to assignate the role ${role} to ${payload.Full_name}.`)
            }

            _createUserLog('Register', user_addition.Id)
        }
        return parseSuccessOK(res, "Test users with roles were added successfully.")
    } catch (error) {
        console.log(error)
        return parseError(res, 304, `No changes were made: ${error}.`)
    }
}

/**
 * Creates a user_activity_log row for the provided action performed by the user.
 * @param {*} action_performed Action performed by user
 * @param {*} user_id User unique identifier
 */
const _createDetailedUserLog = async(action_performed, details, user_id) => {
    try {
        payload = {
            Action_performed: action_performed,
            userId: user_id,
            Description: details
        }

        if (!payload.Action_performed || !payload.userId || !payload.Description)
            throw new Error('Action performed, Description or user identifier is null')

        const addition = await User_logging.create(payload)
        if (!addition)
            throw new Error('Could not add user log. No changes were made.')
    } catch (error) {
        throw new Error(`${error}`)
    }
}

/**
 * Creates a user_activity_log row for the provided action performed by the user.
 * @param {*} action_performed Action performed by user
 * @param {*} user_id User unique identifier
 */
const _createUserLog = async(action_performed, user_id) => {
    try {
        payload = {
            Action_performed: action_performed,
            userId: user_id
        }

        if (!payload.Action_performed || !payload.userId)
            throw new Error('Action performed or user identifier is null')

        const addition = await User_logging.create(payload)
        if (!addition)
            throw new Error('Could not add user log. No changes were made.')
    } catch (error) {
        throw new Error(`${error}`)
    }
}

/**
 * Creates a hashed password using bcrypt and 10 salt rounds.
 * @param {*} plain_password Plain text with the password to convert.
 * @returns Hashed password with bcrypt.
 */
const _generateHashedPassword = async(plain_password) => {
    const hash = await bcrypt.hash(plain_password, salt_rounds)
    return hash
}

/**
 * Compares a plain password converting it with bcrypt and comparing them. It makes no unhashing. 
 * @param {*} plain_password Plain text with the password to compare to DB.
 * @param {*} hashed_password Hashed password (usually from DB) to compare with plain.
 * @returns 
 */
const _comparePasswords = async(plain_password, hashed_password) => {
    const result = await bcrypt.compare(plain_password, hashed_password)
    return result
}

module.exports = controller;