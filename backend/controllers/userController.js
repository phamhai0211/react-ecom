const ErrorHandler = require('../utils/errorhander')
const catchErr = require('../middleware/catchErr')

const User = require('../models/userModel')
const { models } = require('mongoose')
const sendToken = require('../utils/jwtToken')
const ErrorHander = require('../utils/errorhander')
const sendEmail = require('../utils/sendEmail')
const crypto = require('crypto')
const cloudinary = require('cloudinary')
//Register  user

exports.registerUser = catchErr(async (req, res, next) => {

    const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
        folder: "avatars",
        width: 150,
        crop: "scale",
        public_id: `${Date.now()}`,
        resource_type: "auto",
    })
    const { name, email, password } = req.body
    const user = await User.create({
        name, email, password,
        avatar: {
            public_id: myCloud.public_id,
            url: myCloud.secure_url
        }

    })
    sendToken(user, 200, res)

})

//login user

exports.loginUser = catchErr(async (req, res, next) => {
    const { email, password } = req.body

    if (!email || !password) {
        return next(new ErrorHandler("please enter email and password", 400))
    }

    const user = await User.findOne({ email }).select("+password")
    if (!user) {
        return next(new ErrorHandler("email or password invalid", 401))
    }

    const isPasswordMatched = await user.comparePassword(password)

    if (!isPasswordMatched) {
        return next(new ErrorHandler("password invalid", 401))
    }

    const token = user.getJWTToken()

    sendToken(user, 200, res)
})

//logout 
exports.logoutUser = catchErr(async (req, res, next) => {
    res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true
    })

    res.status(200).json({ success: true, message: "logged out" })
})

//forgot password 
exports.forgotPassword = catchErr(async (req, res, next) => {

    const user = await User.findOne({ email: req.body.email })

    if (!user) {
        return next(new ErrorHandler("user not found", 404))
    }

    const resetToken = user.getResetPasswordToken()

    await user.save({ validateBeforeSave: false })

    // const resetPasswordUrl = `${req.protocol}://${req.get(
    //     "host"
    //     )}/password/reset/${resetToken}`

const resetPasswordUrl = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`
    const message = `your password reset token is :- \n\n ${resetPasswordUrl} 
                     \n\nif you have not request this email. ignore it`

    try {
        await sendEmail({
            email: user.email,
            subject: 'Ecommerce Password Recovery',
            message
        })

        res.status(200).json({
            success: true,
            message: `email send to ${user.email} successfull ${user}`
            
        })
    }
    catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({ validateBeforeSave: false })

        return next(new ErrorHander(error.message, 500))
    }
})

//reset password
exports.resetPassword = catchErr(async (req, res, next) => {

    //creating token hash
    const resetPasswordToken = crypto
        .createHash("sha256")
        .update(req.params.token)
        .digest("hex")

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() },
    }
    )

    if (!user) {
        return next(new ErrorHander(`reset password token is invalid ${resetPasswordToken}`, 400))

    }

    if (req.body.password !== req.body.confirmPassword) {
        return next(new ErrorHander("password is not password", 400))
    }

    user.password = req.body.password

    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save()

    sendToken(user, 200, res)
})

//get user detail

exports.getUserDetails = catchErr(async (req, res, next) => {
    const user = await User.findById(req.user.id)

    res.status(200).json({
        success: true,
        user
    })
})

// //update password 
exports.updateUserPassword = catchErr(async (req, res, next) => {

    const user = await User.findById(req.user.id).select("+password")

    const isPasswordMatched = await user.comparePassword(req.body.oldPassword)

    if (!isPasswordMatched) {
        return next(new ErrorHander("old password not match",400))
    }

    if(req.body.newPassword !== req.body.confirmPassword){
        return next(new ErrorHander("confirm password not match",400))
    }
    user.password = req.body.newPassword

    await user.save()

    sendToken(user, 200, res)
})

//update user profile

exports.updateUserProfile = catchErr(async (req, res, next) => {
    const newUserData = {
      name: req.body.name,
      email: req.body.email,
    };
  
    if (req.body.avatar !== "") {
      const user = await User.findById(req.user.id);
  
      const imageId = user.avatar.public_id;
  
      await cloudinary.v2.uploader.destroy(imageId);
  
      const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
        folder: "avatars",
        width: 150,
        crop: "scale",
      });
  
      newUserData.avatar = {
        public_id: myCloud.public_id,
        url: myCloud.secure_url,
      };
    }
  
    const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    });
  
    res.status(200).json({
      success: true,
    });
  });


//get all users admin

exports.getAllUser = catchErr(async (req, res, next) => {

    const users = await User.find()

    res.status(200).json({ success: true, users })
})

//get single users --Admin  

exports.getSingleUser = catchErr(async (req, res, next) => {

    const user = await User.findById(req.params.id)

    if (!user) {
        return next(new ErrorHander(`not find user with id: ${req.user.id}`))
    }

    res.status(200).json({
        success: true,
        user,

    })

})

//update user role (admin)

exports.updateUserRole = catchErr(async (req, res, next) => {

    const newUserData = {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role
    }

    await User.findByIdAndUpdate(req.params.id, newUserData, {
        new: true,
        runValidators: true,
        userFindAndModify: false
    })

    res.status(200).json({ success: true, message: "update success" })
})

//delete user 

exports.deleteUser = catchErr(async (req, res, next) => {

    const user = await User.findById(req.params.id)

    if (!user) {
        return next(new ErrorHander(`user does not exist with id:${req.params.id}`, 400));
    }

    await user.delete()

    res.status(200).json({ success: true, message: "delete success" })
})