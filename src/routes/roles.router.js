const { Router } = require('express')
const router = Router()
const auth = require('../middlewares/auth')

const user = require('../controllers/user.controller')

/**
 * http://host:port/api/roles/
 * Resolves all the endpoints related to a single user requests..
 */
router.route('/find/:id')
    .post(user.assignPermissionToRole)

module.exports = router