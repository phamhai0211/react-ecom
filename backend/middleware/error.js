const ErrorHandler = require('../utils/errorhander')

module.exports = (err,req,res,next)=>{
    err.statusCode = err.statusCode || 500
    err.message = err.message || "internal server error"

    //wrong mongodb id

    if(err.name === 'CastError'){
        const message = `resoure not found. invalid: ${err.path}`
        err = new ErrorHandler(message,400)
    }


    // moongo duplicate key

    if(err.code === 11000){
        const message = `Duplicate ${Object.keys(err.keyValue)}`
        err = new ErrorHandler(message,400)
    }


    //Wrong jwt 

    if(err.name === "JsonwebTokenError"){
        const message = `Jsonwebtoken is invalid, try again`
        err = new ErrorHandler(message,400)
    }

    //Wrong Expried 

    if(err.name === "TokenExpiredError"){
        const message = `TokenExpired is invalid, try again`
        err = new ErrorHandler(message,400)
    }
    res.status(err.statusCode).json({
         suscess: false,
         message: err.message
    })
}

