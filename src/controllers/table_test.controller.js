const { parseSuccessOK, parseError } = require('../utils/parser.utils')
const { Op } = require('sequelize')
const Table_test = require('../models/table_test.model')

controller = {}

/**
 * Returns all rows from 'table_test' table in MS SQL Server database.
 * @param {*} req HTTP request
 * @param {*} res HTTP response
 */
controller.getAllTableTests = async(req, res) => {
    try {
        const found = await Table_test.findAll()
        return parseSuccessOK(res, found)
    } catch (error) {
        return parseError(res, 500, error)
    }
}

/**
 * Returns all rows from 'table_test' table in MS SQL Server database that match with the given pattern.
 * @param {*} req HTTP request
 * @param {*} res HTTP response
 */
controller.getAllTableTestsWithLetter = async(req, res) => {
    try {
        const pattern = req.body.pattern
        const condition = pattern ? {
            Name: {
                [Op.like]: `%${pattern}%`
            }
        } : null
        const found = await Table_test.findAll({ where: condition })
        return parseSuccessOK(res, found)
    } catch (error) {
        return parseError(res, 500, error)
    }
}

/**
 * Returns all rows from 'table_test' table in MS SQL Server database that match with the given pattern.
 * @param {*} req HTTP request
 * @param {*} res HTTP response
 */
controller.getAllTableTestsById = async(req, res) => {
    try {
        const id = req.body.id
        const found = await Table_test.findByPk(id)
        return parseSuccessOK(res, found)
    } catch (error) {
        return parseError(res, 500, error)
    }
}

/**
 * Creates a new row for the table 'Table_tests'.
 * @param {*} req HTTP request
 * @param {*} res HTTP response
 */
controller.insertTableTest = async(req, res) => {
    try {
        const Name = req.body.Name
        if (!Name) return parseError(res, 500, 'Please provide a Name of the new table_test row.')

        const payload = { Name }
        const addition = await Table_test.create(payload)
        return parseSuccessOK(res, addition)
    } catch (error) {
        return parseError(res, 500, error)
    }
}

/**
 * Update row from the table 'Table_tests'.
 * @param {*} req HTTP request
 * @param {*} res HTTP response
 */
controller.updateTableTest = async(req, res) => {
    try {
        const Id = req.params.id
        const Name = req.body.Name
        if (!Name || !Id) return parseError(res, 500, 'Please provide a valid Id and a new Name of the new table_test row.')

        const payload = { Name }
        const updation = await Table_test.update(payload, {
            where: { Id: Id }
        })
        return parseSuccessOK(res, updation)
    } catch (error) {
        return parseError(res, 500, error)
    }
}

/**
 * Update row from the table 'Table_tests'.
 * @param {*} req HTTP request
 * @param {*} res HTTP response
 */
controller.deleteTableTest = async(req, res) => {
    try {
        const Id = req.params.id
        const deletion = Table_test.destroy({
            where: { Id: Id }
        })
        return parseSuccessOK(res, deletion)
    } catch (error) {
        return parseError(res, 500, error)
    }
}

module.exports = controller;