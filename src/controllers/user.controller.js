import { asynchandler } from "../utils/asynchandler.js";


const registerUser = asynchandler(async(req,res)=>{
    // get user details from frontend
    // validation - not null , undefined
    // check if user already exists : usrname , email
    // check for images , avatar
    // upload them to cloudinary, avatar
    // create  user object - create entry in db
    // remove the password and refresh token field from response
    // check if user created successfully
    // return response to frontend

    const {username,email,password,fullname}= req.body
    console.log("email:",email)
    //  res.staus(201).json({
    //     message: "User registered successfully"
    //     })
     


});


export {registerUser};