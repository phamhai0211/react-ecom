const express = require('express')
const {
    getAllProducts,
    createProduct,
    updateProduct,
    removeProduct,
    getdetailProduct,
    createReviewProduct,
    getAllReviewProducts,
    deleteReview,
    getAdminProducts
} = require('../controllers/productsController');
const { isAuthUser, authorizeRoles } = require('../middleware/auth');


const router = express.Router()

//products
router.route('/products').get(getAllProducts);
router.route('/admin/product/new').post(isAuthUser, createProduct);
router.route('/admin/product/:id')
    .put(isAuthUser, authorizeRoles("admin"), updateProduct)
    .delete(isAuthUser, authorizeRoles("admin"), removeProduct)
    .get(isAuthUser, authorizeRoles("admin"), getdetailProduct)
router.route('/admin/products').get(isAuthUser,authorizeRoles("admin"), getAdminProducts)
router.route('/product/:id').get(getdetailProduct)
router.route('/product/review').put(isAuthUser, createReviewProduct)

router.route('/product/reviews')
    .get(isAuthUser, authorizeRoles("admin"), getAllReviewProducts)
    .delete(isAuthUser,authorizeRoles("admin"),deleteReview)
module.exports = router