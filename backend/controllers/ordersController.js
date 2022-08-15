const Order = require('../models/orderModel')
const Product = require('../models/productModel')
const ErrorHander = require('../middleware/error')
const catchError = require("../middleware/catchErr")

//create orders 

exports.newOrder = catchError(async(req,res,next)=>{
    const {
        shippingInfo,
        orderItems,
        paymentInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
       
    } = req.body

    const order = await Order.create({
        shippingInfo,
        orderItems,
        paymentInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paidAt: Date.now(),
        user:req.user._id
    })

    res.status(200).json({
        success: true,
        order
    })
})

//getSinggle order  
exports.getSinggleOrder = catchError(async(req,res,next)=>{
    const order = await Order.findById(req.params.id).populate(
        "user",
        "name email"
    )

    if(!order){
        return next(new ErrorHander("order not found",404))
    }

    res.status(200).json({
        success:true,
        order
    })
})

//get logged in user order  
exports.myOrders = catchError(async(req,res,next)=>{

    const orders = await Order.find({user:req.user._id})
    
    res.status(200).json({
        success:true,
        orders
    })
})
//get all order -- Admin

exports.getAllOrder = catchError(async(req,res,next)=>{
    const orders = await Order.find()

    let totalAmount = 0

    orders.forEach((order)=>{
        totalAmount += order.totalPrice
    })

    res.status(200).json({
        success:true,
        totalAmount,
        orders
    })
})

//update Order Status -- Admin 
exports.updateStatusOrder = catchError(async(req,res,next)=>{
    const order = await Order.findById(req.params.id)

    if(!order){
        return next(new ErrorHander("Order not found",404))
    }   

    if(order.orderStatus === "Delivered"){
        return next(new ErrorHander("You have already delivered this order",400))
    }

    if(req.body.status === "Shipped"){
        order.orderItems.forEach(async (o)=>{
            await updateStock(o.product, o.quantity)
        })
    }

    order.orderStatus = req.body.status

    if(req.body.status === "Delivered"){
        order.deliveredAt = Date.now()
    }

    await order.save({validateBeforeSave:false})

    res.status(200).json({success:true,order})
    
    async function updateStock(id,quantity){
        const product = await Product.findById(id)

        product.Stock -= quantity

        await product.save({validateBeforeSave:false})
    }
})
//delete order -- Admin  
exports.deleteOrder = catchError(async(req,res,next)=>{
    const order = await Order.findById(req.params.id)

    if(!order){
        return next(new ErrorHander("Order not found ",404))
    }

    await order.remove()

    res.status(200).json({success:true})
})