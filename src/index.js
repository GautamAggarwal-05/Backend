// require('dotenv').config({path:'./env'});
import dotenv from "dotenv";
import connectDB from "./db/index.js";

dotenv.config({path: './env'}); // load environment variables from.env file

connectDB()




/*
import express from "express";

const app =    express();
// immediatly execute the arrow funcrtion ()() iffies
( async () => {
    try{
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);

        app.on("error",(error)=>{
            console.log("ERROR could not connect to Mongo");
            throw error
        })

        app.listen(process.env.PORT,()=>{
            console.log(`Server running on port ${process.env.PORT}`)  // log the server listening on port
        })
    }catch(error){
        console.error("ERROR:", error)
        throw error
    }
})()
*/

