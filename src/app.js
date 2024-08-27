import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
const app = express();

//configuration
// THESE ALL .USE are middleware 
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



// routes import
import userRouter from "./routes/user.routes.js"

//phele app.get sai kaam chal jara tha beacuse vahi pai ham routed likhre thai app sai and ussi mai controllers likhre thai but abh hamne routes and controllers alag alag kar diye so now we have to use middleware .use

//route decleartion 
app.use("/api/v1/users",userRouter)
//http://localhost:8080/api/v1/users/register
export {app}