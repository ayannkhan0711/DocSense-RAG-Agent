import mongoose  from "mongoose";
import colors from "colors"

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI)
        console.log(`DB CONNECTION SUCESS: ${conn.connection.name}`.bgGreen.black)
        
    } catch (error) {
        console.log(`DB CONNECTION FAILED : ${error.message}`.bgRed)
    }
}


export default connectDB