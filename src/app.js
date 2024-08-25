import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
const app = express();

//configuration
app.use(cors({
    origin: process.env.CORS_ORIGIN, //which url are allowed to access backend 
    credentials: true,//allow credentials
}));

app.use(express.json({ // for json data
    limit: "16kb"
}));
//for url
app.use(express.urlencoded({extended: true,limit: "16kb"}));
//to store img file make public assest
app.use(express.static("public"))
//user kai browser kai andar ki cookies ko access kar pauu or set kar pau (CRUD operations)
app.use(cookieParser()); 


export {app}