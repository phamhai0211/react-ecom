const express = require('express')
const router = express.Router()

const {
    registerUser,
    loginUser,
    logoutUser,
    forgotPassword,
    resetPassword,
    getUserDetails,
    updateUserPassword,
    updateUserProfile,
    getAllUser,
    getSingleUser,
    updateUserRole,
    deleteUser
} = require('../controllers/userController')
const { isAuthUser, authorizeRoles } = require('../middleware/auth')

router.route('/user/register').post(registerUser)
router.route('/user/login').post(loginUser)
router.route('/user/password/forgot').post(forgotPassword)
router.route('/user/password/reset/:token').put(resetPassword)
router.route('/user/logout').get(logoutUser)
router.route('/user/me').get(isAuthUser, getUserDetails)
router.route('/user/password/update').put(isAuthUser, updateUserPassword)
router.route('/user/me/update').put(isAuthUser, updateUserProfile)
router.route('/admin/users').get(isAuthUser, authorizeRoles("admin"), getAllUser)
router.route('/admin/user/:id')
    .get(isAuthUser, authorizeRoles("admin"), getSingleUser)
    .put(isAuthUser, authorizeRoles("admin"), updateUserRole)
    .delete(isAuthUser, authorizeRoles("admin"),deleteUser)
// router.route(/)
module.exports = router