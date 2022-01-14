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
    .post(user.insertUser)

/**
 * http://host:port/api/users/authenticate
 * Resolves all the endpoints related to users requests.
 */
router.route('/authenticate')
    .post(user.authenticate)

module.exports = router