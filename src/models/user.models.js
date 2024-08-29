import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
    username:{
        type: String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        index:true, //to make a field searchable make index true,Performance heavy
    },
    email:{
        type: String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
    },
    fullname:{
        type: String,
        required:true,
        trim:true,
        index:true
    },
    avatar:{
        type: String, // cloudinary URL
        required:true,
    },
    coverImage:{
        type: String, // cloudinary URL
    },
    watchHistory:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref:"Video"
        }
    ], // array which will store video id which user watched
    password:{
        type: String, // in database keep password encrypted
        required:[true,"Password is required"],
    },
    refreshToken:{
        type: String,
    }

},{timestamps:true});

// save ->event  and yaha pai call back mai dont use arrow function because it does not have this context but iss case mai hame this lagega to access userSchema remember ~ these functions take time
userSchema.pre("save", async function(next){
    if(!this.isModified("password")) return next(); // if password not changed then just skip the process
    this.password = await bcrypt.hash(this.password,10) // round ->10
    next(); 
    //but abh ek problem hai even we change like avatar then also before saving it will change password so run only when password is send  when -> (creation ,updation,new password set)
})// pre-> to execute code just before data is going to be stored in database

// abh password encrypted stored hai database mai so how will we verify password when user enters it for that we will create a method

//creating method userSchema gives us object methods
userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password,this.password) // user send password encrypted password
}

userSchema.methods.generateAcessToken = function(){
    //jwt sign method can generate tokens
   return  jwt.sign({ //payload -> yeh sab rakho tokens mai 
        _id:this._id,
        email:this.email,
        username:this.username,
        fullname:this.fullname,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expriresIn:process.env.ACESS_TOKEN_EXPIRY
    })
}
userSchema.methods.generateRefreshToken = function(){
    return  jwt.sign({ //payload -> yeh sab rakho tokens mai 
        _id:this._id,
    },
    process.env.REFERESH_TOKEN_SECRET,
    {
        expriresIn:process.env.REFERESH_TOKEN_EXPIRY
    })
}


export const User = mongoose.model("User",userSchema);
