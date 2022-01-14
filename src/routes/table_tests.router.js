const { Router } = require('express')
const router = Router()

const table_test = require('../controllers/table_test.controller')

/**
 * http://host:port/api/table_test
 * Resolves all the endpoints related to table_test requests.
 */
router.route('/')
    .get(table_test.getAllTableTests)
    .post(table_test.insertTableTest)

/**
 * http://host:port/api/table_test/:id
 * Resolves all the endpoints related to table_test requests.
 */
router.route('/:id')
    .patch(table_test.updateTableTest)
    .delete(table_test.deleteTableTest)

module.exports = router