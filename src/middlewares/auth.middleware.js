import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { asynchandler } from "../utils/asynchandeller.js";
import jwt from "jsonwebtoken";

export const verifyJWT = asynchandler(async (req,_,next)=>{
try {
        //header autorization in postman 
        const token = req.cookies?.acessToken || req.header("Authorization")?.replace("Bearer ","")
    
        if(!token){
            throw new ApiError(404,"Unauthorized Token")
        }
        
        const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
        // get user by token
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    
        if(!user){
            throw new ApiError(404,"Invalid Access Token")
        }
    
        req.user = user;
        next();
} catch (error) {
        throw new ApiError(401,"Invalid Access Token")
}
})