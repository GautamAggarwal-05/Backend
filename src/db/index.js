//mongoose give a retured object
import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    try{
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}${DB_NAME}`);
        console.log(`\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);
    }catch(err){
        console.error("MONOGB connection error:",err);
        process.exit(1); // process is given by nodeJs
    }
}   

export default connectDB;