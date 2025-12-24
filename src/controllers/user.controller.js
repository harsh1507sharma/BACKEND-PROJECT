import { asynchandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import {User} from "../models/user.model.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/Apiresponse.js";


const registerUser = asynchandler(async(req,res)=>{
    // get user details from frontend
    // validation - not null , undefined
    // check if user already exists : usrname , email
    // check for images , avatar
    // upload them to cloudinary, check avatar
    // create  user object - create entry in db
    // remove the password and refresh token field from response
    // check if user created successfully
    // return response to frontend

    const {username,email,password,fullname}= req.body
    console.log("email:",email)
    //  res.staus(201).json({
    //     message: "User registered successfully"
    //     })
    if(fullname ===""){
        throw new ApiError(400,"Fullname is required")
    }
    if(email===""){
        throw new ApiError(400,"Email is required")
    }
    if(password===""){
        throw new ApiError(400,"Password is required")
    }       
    if(username===""){
        throw new ApiError(400,"Username is required")
    }   


    const existingUser = User.findOne({
        $or : [{email},{username}]
    })
    if(existingUser){
        throw new ApiError(409,"User with given email/username already exists") 
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverimageLocalPath = req.files?.coverimage[0]?.path;
     
    if(!avatarLocalPath){
        throw new ApiError (400,"Avatar image is required")
    } 

    const avatar = await uploadToCloudinary(avatarLocalPath);
    const coverimage = await uploadToCloudinary(coverimageLocalPath);

    if(!avatar){
        throw new ApiError (500,"Unable to upload avatar image , please try again later")
    }

    const user = await User.create({
        username ,
        password,
        fullname,
        email,
        avatar : avatar.url,
        coverimage : coverimage?.url || "", 
    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken");

   if(!createdUser){
        throw new ApiError(500,"Something went wrong while registering the user")
   } 


   return res.status(201).json(
    new ApiResponse(200, "User registered successfully", createdUser)
   )

});


export {registerUser};