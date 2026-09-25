import express from "express"
import dotenv from "dotenv"
import colors from "colors"
import connectDB from "./config/dbconfig.js"


dotenv.config()


import authRoutes from "./routes/authRoutes.js"



const PORT = process.env.PORT || 8080

const app = express()

app.use(express.json())


// DB Connection 
connectDB()


//AUTH ROUTES
app.use("/api/auth", authRoutes)




app.listen(PORT , () => {
    console.log(`SERVER IS RUNNING AT PORT : ${PORT}`.bgBlue)
})