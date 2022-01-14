const { parseSuccess, parseSuccessOK, parseError, parseSQLData } = require('../utils/parser.utils')
const env = require('../environment')
const { Op } = require('sequelize')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt');
const salt_rounds = 10;
const User = require('../models/user.model')
const User_role = require('../models/user_role.model')
const Role = require('../models/role.model')

/**
 * Module controller that resolves all the user requests.
 */
controller = {}

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
                attributes: ['Description'], // Only need the role 'Description' field.
            }
        })

        // Obligatory: Convert Sequelize data to JSON object when having to treat some attributes as below.
        data = parseSQLData(found)

        if (role_filters)
            data = data.filter(user => user.roles.some(role => role_filters.includes(role.Description)))
        for (const user of data) {
            user.roles = user.roles.map(r => r.Description)
        }

        return parseSuccessOK(res, data)
    } catch (error) {
        console.log("Error:", error)
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

            return parseSuccessOK(res, payload)
        }

        return parseError(res, 400, "Wrong password.")

    } catch (error) {
        console.log(error)
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
        if (addition) return parseSuccess(res, 201, 'User successfully created.')
        return parseError(res, 304, 'No changes were made.')
    } catch (error) {
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
        }
        return parseSuccessOK(res, "Test users with roles were added successfully.")
    } catch (error) {
        console.log(error)
        return parseError(res, 304, `No changes were made: ${error}.`)
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