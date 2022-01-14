const { parseSuccess, parseSuccessOK, parseError, parseSQLData } = require('../utils/parser.utils')
const env = require('../environment')
const { Op } = require('sequelize')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt');
const salt_rounds = 10;
const User = require('../models/user.model')
const User_role = require('../models/user_role.model')
const Role = require('../models/role.model')

controller = {}

/**
 * Returns all rows from 'user' table in MS SQL Server database.
 * @param {*} req HTTP request
 * @param {*} res HTTP response
 */
controller.getAllUsers = async(req, res) => {
    try {
        const found = await User.findAll({
            attributes: {
                exclude: ['Password'] // Don't return user password.
            },
            include: { // Bring related 'roles' rows.
                model: Role,
                attributes: ['Description'], // Only need the role 'Description' field.
            },
            where: {
                '$roles.Id$': [1, 2] // Filter 'users' rows with 'roles' table filter.
            },
        })

        // Obligatory: Convert Sequelize data to JSON object when having to treat some attributes as below.
        const data = parseSQLData(found)
        for (const user of data) {
            user.roles = user.roles.map(r => r.Description)
        }

        return parseSuccessOK(res, data)
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

        if (!found[0])
            return parseError(res, 404, `The username ${credentials.Username} is not registered.`)

        const correct_password = await _comparePasswords(credentials.Password, found[0].Password)

        delete found[0].Password
        const token = jwt.sign({
                ...found[0]
            },
            env.JWT_KEY, {
                expiresIn: "365d",
            }
        );

        const payload = {
            status: correct_password ? 'OK' : 'Wrong password',
            token
        }

        return parseSuccessOK(res, payload)
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
controller.insertUser = async(req, res) => {
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
        if (addition) return parseSuccess(res, 201, "User successfully created.")
        return parseError(res, 304, "No changes were made.")
    } catch (error) {
        return parseError(res, 500, error)
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