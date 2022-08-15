const express = require('express');
const router = express.Router()

const {
    newOrder,
    getSinggleOrder,
    myOrders,
    getAllOrder,
    updateStatusOrder,
    deleteOrder
} = require('../controllers/ordersController')
const { isAuthUser, authorizeRoles } = require('../middleware/auth');


router.route('/order/new').post(isAuthUser, newOrder)
router.route('/order/:id').get(isAuthUser, getSinggleOrder)
router.route('/orders/me').get(isAuthUser, myOrders)
router.route('/admin/orders')
    .get(isAuthUser, authorizeRoles("admin"), getAllOrder)

router.route('/admin/order/update')
    .put(isAuthUser, authorizeRoles("admin"), updateStatusOrder)
    .delete(isAuthUser, authorizeRoles("admin"),deleteOrder)

module.exports = router