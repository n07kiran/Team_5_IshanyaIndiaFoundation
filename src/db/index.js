import mongoose from "mongoose";
import dotenv from "dotenv"
dotenv.config()

import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    try{
        // console.log(`connection URL : ${process.env.MONGODB_URI}/${DB_NAME}`)
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        // console.log(`\n connectionInstance : ${connectionInstance} \n`)
        console.log(`\n MongoDb connected successfully ! DB Host : ${connectionInstance.connection.host}`);
    }catch(err){
        console.log("MongoDB connnection error ", err);
        process.exit(1);
    }
}

export default connectDB;