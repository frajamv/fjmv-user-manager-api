const { Router } = require('express')
const router = Router()
const auth = require('../middlewares/auth')

const user = require('../controllers/user.controller')

/**
 * http://host:port/api/users
 * Resolves all the endpoints related to users requests.
 */
router.route('/')
    .get(auth, user.getAllUsers)
    .post(user.registerUser)

/**
 * http://host:port/api/users/authenticate
 * Resolves all the endpoints related to user session requests.
 */
router.route('/authenticate')
    .post(user.authenticate)

/**
 * http://host:port/api/users/testcase
 * Resolves all the endpoints related to user management testing.
 */
router.route('/testcase')
    .post(user.fillTestUsers)

module.exports = router