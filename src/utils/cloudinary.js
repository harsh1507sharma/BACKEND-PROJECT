import { v2 as cloudinary } from 'cloudinary'
import fs from 'fs'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY ,
  api_secret: process.env.CLOUDINARY_API_SECRET 
});


const uploadToCloudinary = async (LocalfilePath) =>{
    try {
        if(!LocalfilePath) return null;
        //uploading file to cloudinary
        const response = await cloudinary.uploader.upload(LocalfilePath,{
            resource_type: "auto",
        })

        //file uploaded successfully
        console.log("file is uploaded on cloudinary",response.secure_url);
        return response

    } catch (error) {
        fs.unlinkSync(LocalfilePath); // remove file from local uploads folder as file upload operation failed
        return null
    }
}


export {uploadToCloudinary};
