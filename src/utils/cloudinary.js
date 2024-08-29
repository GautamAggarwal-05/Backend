import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"; // file system in node.js

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET  // Click 'View API Keys' above to copy your API secret
});

const uploadOnCloudinary = async(localFilePath) =>{
    try {
        if(!localFilePath) return null;
        const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type: "auto"
        })
        //file uploaded successfully
        console.log("File is uploaded successfully on cloudinary",response.url)
        // fs.unlink(localFilePath)
        return response;    
    } catch (error) {
        //deleted the file from the server
        fs.unlinkSync(localFilePath); // remove the locally save temp file as the upload operation failed
        return null
    }
}
// cloudinary.v2.uploader.upload('https://res.cloudinary.com/demo/image/upload/getting-started/shoes.jpg',
//             {
//                public_id: 'shoes',
//            },
//            function(error,result) {console.log(result);}
//        );


export {uploadOnCloudinary}
