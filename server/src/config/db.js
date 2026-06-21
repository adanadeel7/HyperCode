import mongoose from "mongoose";

const ConnectDB = async() => {
    try {
        const mongoURI = process.env.MONGO_URI
        const conn = await mongoose.connect(mongoURI)
        console.log(`MongoDB Connected Successfully`)
    } catch (error) {
        console.error(`Database Connection Error ${error.message}`)
        process.exit(1); 
    }
}

export default ConnectDB; 

