const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const errorMiddleware = require('./middleware/error')
const fileUpload = require("express-fileupload")
// const path = require("path")
const bodyParser = require("body-parser")

//config  
// if(process.env.NODE_ENV !== 'PRODUCTION'){
//     require("dotenv").config({ path:"backend/config/config.env"})
// }
require("dotenv").config({ path:"backend/config/config.env"})
app.use(express.json())
app.use(cookieParser())
app.use(bodyParser.urlencoded({extended:true}))
app.use(fileUpload())
//route
const product = require("./routes/productRoute")
const user = require("./routes/userRoute")
const order = require("./routes/orderRoute")
const payment = require("./routes/paymentRoute")
app.use("/api",product)
app.use("/api",user)
app.use("/api",order)
app.use("/api",payment)
// app.use(express.static(path.join(__dirname,"../frontend/build")))

// app.get("*",(req,res)=>{
//     res.sendFile(path.resolve(__dirname,"../frontend/build/index.html"))
// })
//import middleware

app.use(errorMiddleware)

module.exports = app