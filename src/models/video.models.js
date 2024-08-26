import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const videoSchema = new mongoose.Schema({
    videoFile:{
        type:String, // Cloudinary file
        required:true
    },
    thumnail:{
        type:String, // Cloudinary file
        required:true
    },
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    duration:{
        type:Number,  // send by cloudinary ki video ka duration kya hai
        required:true
    },
    view:{
        type:Number,
        default:0
    },
    isPublished:{
        type:Boolean,
        default:true,
    },
    Videowner:{
        type:Schema.Types.ObjectId,
        ref:"User",
    }

},{timestamps:true});

//agregation Pipelne
videoSchema.plugin(mongooseAggregatePaginate) // now we can write aggregate queries in this 

export const Video = mongoose.model("Video",videoSchema);
