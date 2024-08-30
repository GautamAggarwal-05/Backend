import { asynchandler } from "../utils/asynchandeller.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.models.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";

const generateAccessAndRefereshTokens = async(userId) =>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return {accessToken, refreshToken}


    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}


const registerUser = asynchandler( async(req,res) =>{
        // res.status(200).json({
        //     message: "ok"
        // })

        //1.get user detail from frontend
        console.log("req.body:",req.body);
        const {fullname,email,username,password} = req.body // express gave us .body to directly acces data
        console.log("email:",email);
        // if(fullname === ""){
        //     throw new ApiError(400,"fullname is required")
        // }

        //2.validation - not empty 
        if([fullname,email,username,password].some((field)=>field?.trim() === ""))
        {
            throw new ApiError(400,"All fields are required")
        }
        //this User can communiacte with our database
        const existedUser = await User.findOne({ // to get user by email or password
            $or:[{username},{email}]
        })// we have to check either username or email exists
        console.log("existedUser",existedUser)
        //3. check if user already exist: by username,email
        if(existedUser){
            throw new ApiError(409,"User with email or username already exists")
        }

        console.log("req.files:",req.files)
        //4. check for images , check for avatar
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
        //5. upload them to cloudinary,avatar
        const avatar = await uploadOnCloudinary(avatarLocalPath)
        const coverImage = await uploadOnCloudinary(coverImageLocalPath)

        if(!avatar){
            throw new ApiError(400,"Avatar file is required:cloudinary")
        }
        //6. create user object - create entry in db .create 
        const user = await User.create({
            fullname,
            avatar: avatar.url,
            coverImage: coverImage?.url || "",
            email,
            password,
            username: username.toLowerCase()
        })
        // is user created and removing password and refresh token?
        //7. remove password and refresh token filed from response 
       const createdUser =  await User.findById(user._id).select(
        "-password -refreshToken"
       )
       //8. check for user creation
       if(!createdUser){
        throw new ApiError(500,"Something went wrong while registering the user")
       }

       //9. return response 
       return res.status(201).json(
        new ApiResponse(200,createdUser,"User Registered successfully")
       )
})

const loginUser = asynchandler(async(req,res)=>{
    // req body -> data
    const {email,username,password} = req.body
    // username or email
    if(!username && !email){
        throw new ApiError(400,"Email or Username and Password are required")
    }
    //find the user 
    const user = await User.findOne({
        $or:[{email},{username}]
    }) 

    if(!user){
        throw new ApiError(404,"User Doest  not exist")
    }
    //password check 
    const isPasswordValid = await user.isPasswordCorrect(password)
    if(!isPasswordValid){
        throw new ApiError(401,"Invalid user credentials")
    }
    // access and refresh token generate
    const {accessToken,refreshToken}  = await generateAccessAndRefereshTokens(user._id)
    // send tokens ->cookies
    // due to using findOne we got some unwanted fields like password which we dont want to show to user 
   const loogedInUser = await  User.findById(user._id).select("-password -refreshToken")

   const options = {
    httpOnly:true, // cookies will only be modified by server
    secure:true
   }

   return res.status(200)
   .cookie("accessToken",accessToken,options)
   .cookie("refreshToken",refreshToken,options)
   .json(new ApiResponse(200,{
    user: loogedInUser, accessToken,refreshToken},"User Logged in Successfully")    );
})

const logoutUser = asynchandler(async(req,res) => {
    //dikat -> hame user ni pata kese laye logout kai liye form thodi banayega email password mangne vala
    // Write our middleware to create user in request by the help of token
    //clear cookies
    User.findByIdAndUpdate(req.user._id,{
        //operator of mongodb it gives object whatever we want to update put it in this object
        $set:{refreshToken:undefined}
    },
    {
        new:true // now the retured response has new updated values
    })

    const options={
        httpOnly:true,
        secure:true
    }

    return res.status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refershToken",options)
    .json(new ApiResponse(200,{},"User Logged Out"))    
})

const refreshAccessToken = asynchandler(async(req,res) =>{
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken){
        throw new ApiError(404,"Unauthorised request")
    }

    //verify refresh token beacuse vo encrpyted hota hai -> jo token database mai hai aur jo user pai gaya vo same nahi hote  it takes token and secret token

    try {
        const decodedToken = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id)
        if(!user){
            throw new ApiError(401,"Invalid Refresh Token")
        }
    
        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401,"Refresh Token is expired or used") 
        }
    
        // now we can create new token 
        const options = {
            httpOnly:true,
            secure:true
        }
    
        const {accessToken,newRefreshToken} = await generateAccessAndRefereshTokens(user._id)
    
        return res.status(200)
        .cookies("accessToken",accessToken,options)
        .cookies("refreshToken",newRefreshToken,options)
        .json(new ApiResponse(200,{accessToken, refreshToken: newRefreshToken},"Access Token Refreshed "))
    } catch (error) {
        throw new ApiError(500,error?.message || "Something went wrong while refreshing access token")
    }
})

const changeCurrentPassword = asynchandler(async(req,res)=>{

    const {oldPassword,newPassword} = req.body
    //agar vo password change kar para hai it means vo logged in so vo middleware sai gaya hoga means req mai user hai jaha sai ham id nikal sakte hai 
    const user = await User.findById(req.user?._id)

    const isPasswordCorrect =  user.isPasswordCorrect(oldPassword)
    if(!isPasswordCorrect){
        throw new ApiError(400,"Invalid old password")
    }

    user.password = newPassword
    await user.save({validateBeforeSave: false})

    return res.status(200).json(new ApiResponse(200,{},"Password changed successfully"))
})

const getCurrentUser = asynchandler((req,res)=>{
    return res.status(200)
    .json(new ApiResponse(200,req.user,"current user fetched successfully"))
})

const updateAccountDetails = asynchandler((req,res)=>{
    const {fullname,email} = req.body;
    if(!fullname || !email){
        return new ApiError(404,"All fields are required")
    }

    const user = User.findByIdAndUpdate(req.user?._id,{ // we directly called and updated user 
        $set:{
            fullname,
            email:email, // both ways are correct
        }
    },{
        // new:true means jo values update hui hai vo return kardo
        new:true
    }).select("-password")

    return res.status(200).json(200,{user},"Account details updated successfully")
})

const updateUserAvatar = asynchandler(async(req,res)=>{
    //this time we write file not files becasue now we are only takef one field -> go check user.router register
    const avatarLocalpath = req.file?.path

    if(!avatarLocalpath){
        throw new ApiError(400,"Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalpath)
    if(!avatar.url){
        throw new ApiError(400,"Failed to upload avatar to cloudinary")
    }

    const user  = await User.findByIdAndUpdate(req.user?._id,
        {
            $set:{// set is an operator of database
                avatar:avatar.url
            }
        },
        {new:true}
    )
    return res.status(200).json(200,{user},"Avatar updated successfully")
})
const updateUserCoverImage = asynchandler(async(req,res)=>{
    //this time we write file not files becasue now we are only takef one field -> go check user.router register
    const coverImageLocalpath = req.file?.path

    if(!coverImageLocalpath){
        throw new ApiError(400,"Avatar file is required")
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalpath)
    if(!coverImage.url){
        throw new ApiError(400,"Failed to upload coverImage to cloudinary")
    }

    const user = await User.findByIdAndUpdate(req.user?._id,
        {
            $set:{// set is an operator of database
                coverImage:coverImage.url
            }
        },
        {new:true}
    )
    return res.status(200).json(200,{user},"Avatar updated successfully")
})
export { registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage } 