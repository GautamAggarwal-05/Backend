import { asynchandler } from "../utils/asynchandeller.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.models.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
//get user detail from frontend
//validation - not empty 
// check if user already exist: by username,email
// check for images , check for avatar
//upload them to cloudinary,avatar
//create user object - create entry in db .create 
//remove password and refresh token filed from response 
//check for user creation
//return response 
const registerUser = asynchandler( async(req,res) =>{
        // res.status(200).json({
        //     message: "ok"
        // })
        console.log("req.body:",req.body);
        const {fullname,email,username,password} = req.body // express gave us .body to directly acces data
        console.log("email:",email);
        // if(fullname === ""){
        //     throw new ApiError(400,"fullname is required")
        // }
        if([fullname,email,username,password].some((field)=>field?.trim() === ""))
        {
            throw new ApiError(400,"All fields are required")
        }
        //this User can communiacte with our database
        const existedUser = await User.findOne({
            $or:[{username},{email}]
        })// we have to check either username or email exists
        console.log("existedUser",existedUser)
        if(existedUser){
            throw new ApiError(409,"User with email or username already exists")
        }

        console.log("req.files:",req.files)
        //to acess file multer gave us .files
        const avatarLocalPath = req.files?.avatar[0]?.path;
        // const coverImageLocalPath = req.files?.coverImage[0]?.path;

        let coverImageLocalPath;
        if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
            coverImageLocalPath = req.files.coverImage[0].path;
        }

        if(!avatarLocalPath){
            throw new ApiError(400,"Avatar file is required:localpath")
        }

        const avatar = await uploadOnCloudinary(avatarLocalPath)
        const coverImage = await uploadOnCloudinary(coverImageLocalPath)

        if(!avatar){
            throw new ApiError(400,"Avatar file is required:cloudinary")
        }

        const user = await User.create({
            fullname,
            avatar: avatar.url,
            coverImage: coverImage?.url || "",
            email,
            password,
            username: username.toLowerCase()
        })
        // is user created and removing password and refresh token?
       const createdUser =  await User.findById(user._id).select(
        "-password -refreshToken"
       )

       if(!createdUser){
        throw new ApiError(500,"Something went wrong while registering the user")
       }

       return res.status(201).json(
        new ApiResponse(200,createdUser,"User Registered successfully")
       )
})

export { registerUser }