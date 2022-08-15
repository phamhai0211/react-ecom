const app = require('./app')

const dotenv = require('dotenv')
const connectDatabase = require('./config/database')
const cloudinary = require('cloudinary')
//unhander promise
process.on("uncaughtException", (err) => {
    console.log(`err: ${err.message}`)
    console.log("shuting down server")

    process.exit(1)
})
//config
// if(process.env.NODE_ENV !== "PRODUCTION"){
//     dotenv.config({path:"backend/config/config.env"})
// }
dotenv.config({ path: "backend/config/config.env" })
//connect database

connectDatabase()

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})
const server = app.listen(process.env.PORT, () => {
    console.log(`listening on port http://localhost:${process.env.PORT}`)
})

//unhander promise reject
process.on("uncaughtException", (err) => {
    console.log(`err: ${err.message}`)
    console.log("shuting down the server")

    server.close(() => {
        process.exit(1)
    })
})  