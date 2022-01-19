const { Router } = require('express')
const router = Router()
const auth = require('../middlewares/auth')

const user = require('../controllers/user.controller')

/**
 * http://host:port/api/users/:id
 * Resolves all the endpoints related to a single user requests..
 */
router.route('/:id')
    .post(user.getOneUser)
    .delete(user.deleteUser)

/**
 * http://host:port/api/users
 * Resolves all the endpoints related to users requests.
 */
router.route('/')
    // .get(auth, user.getAllUsers) Token disabled for dev testing.
    .get(user.getAllUsers)
    .post(user.registerUser)

/**
 * http://host:port/api/users/authenticate
 * Resolves all the endpoints related to user session requests.
 */
router.route('/authenticate')
    .post(user.authenticate)

/**
 * http://host:port/api/users/role
 * Resolves all the endpoints related to user session requests.
 */
router.route('/role')
    .get(user.getAllRoles)
    .post(user.assignRoleToUser)
    .patch(user.deassignRoleToUser)
    .put(user.setUserRoles)

/**
 * http://host:port/api/users/log/:id
 * Resolves all the endpoints related to user logging.
 */
router.route('/log/:id')
    .get(user.getSingleUserLogs)

/**
 * http://host:port/api/users/log
 * Resolves all the endpoints related to user logging.
 */
router.route('/log')
    .get(user.getUserLogs)

/**
 * http://host:port/api/users/testcase
 * Resolves all the endpoints related to user management testing.
 */
router.route('/testcase')
    .post(user.fillTestUsers)

module.exports = router