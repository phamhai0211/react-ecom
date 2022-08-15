const Product = require('../models/productModel')

const ErrorHandler = require('../utils/errorhander')
const catchErr = require('../middleware/catchErr')
const ApiFeature = require('../utils/apiFeature')
const cloudinary = require("cloudinary")
//create product

exports.createProduct = catchErr(async (req, res, next) => {
    let images = []

    if (typeof req.body.images === "string") {
        images.push(req.body.images)
    }
    else {
        images = req.body.images
    }

    const imagesLink = []

    for (let i = 0; i < images.length; i++) {
        const result = await cloudinary.v2.uploader.upload(images[i], {
            folder: "products",
            width: 150,
            crop: "scale",
            public_id: `${Date.now()}`,
            resource_type: "auto"
        })
        imagesLink.push({
            public_id: result.public_id,
            url: result.secure_url
        })
    }


    req.body.images = imagesLink
    req.body.user = req.user.id
    const product = await Product.create(req.body);


    res.status(200).json({
        success: true,
        product
    })
})

//get all products
exports.getAllProducts = catchErr(async (req, res) => {
    const resultPerPage = 8
    const productsCount = await Product.countDocuments()

    const apiFeature = new ApiFeature(Product.find(), req.query)
        .search()
        .filter()


    let products = await apiFeature.query;
    let filteredProductsCount = products.length;
    apiFeature.pagination(resultPerPage);
    products = await apiFeature.query.clone()

    res.status(200).json({

        success: true,
        products,
        productsCount,
        resultPerPage,
        filteredProductsCount

    })
})
// get all product (Admin)
exports.getAdminProducts = catchErr(async (req, res, next) => {
    const products = await Product.find()

    res.status(200).json({
        success: true,
        products
    })
})
// get product detail
exports.getdetailProduct = catchErr(async (req, res, next) => {
    const product = await Product.findById(req.params.id)

    if (!product) {
        return next(new ErrorHandler("product not found", 500))
        // return res.status(500).json({
        //     success:false,
        //     message:"product not found"
        // })
    }


    res.status(200).json({
        success: true,
        product
    })
})
//update product
exports.updateProduct = catchErr(async (req, res, next) => {
    let product = await Product.findById(req.params.id)

    if (!product) {
        return next(new ErrorHandler("product not found", 500))
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
        useFindandModify: true
    })

    res.status(200).json({
        success: true,
        product
    })
})

//remove product

exports.removeProduct = catchErr(async (req, res, next) => {

    const product = await Product.findById(req.params.id)

    if (!product) {
        return next(new ErrorHandler("product not found", 500))
    }

    await product.remove();

    res.status(200).json({
        success: true,
        message: "product has del"
    })
})

//create review product 
exports.createReviewProduct = catchErr(async (req, res, next) => {
    const { rating, comment, productId } = req.body

    const reviewData = {
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment,
    }

    const product = await Product.findById(productId)

    const isReviewed = product.reviews.find(
        (rev) => rev.user.toString() === req.user._id.toString()
    )
    if (isReviewed) {
        product.reviews.forEach(rev => {
            if (rev.user.toString() === req.user._id.toString())
                (rev.rating = rating), (rev.comment = comment)
        })
    } else {
        product.reviews.push(reviewData)
        product.numOfReviews = product.reviews.length
    }

    let avg = 0;
    product.reviews.forEach(rev => {
        avg += rev.rating
    })

    product.ratings = avg / product.reviews.length

    await product.save({ validateBeforeSave: false })

    res.status(200).json({
        success: true,
    })
})

// get all products review r

exports.getAllReviewProducts = catchErr(async (req, res, next) => {

    const product = await Product.findById(req.query.id)

    if (!product) {
        return next(new ErrorHandler("Product not found", 400))
    }

    res.status(200).json({
        success: true,
        reviews: product.reviews
    })
})

//delete review product

exports.deleteReview = catchErr(async (req, res, next) => {

    const product = await Product.findById(req.query.id)

    if (!product) {
        return next(new ErrorHandler("Product not found", 400))
    }
})