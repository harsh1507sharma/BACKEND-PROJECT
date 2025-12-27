import { asynchandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import {User} from "../models/user.model.js";


export const verifyjwt = asynchandler (async (req, res, next)  => {
   try {
     const token = req.cookies?.accesstoken || req.header("Authorization")?.replace("Bearer ","")
 
     if(!token){
         throw new ApiError (401,"Unauthorized , token not found")
     }
     const decodedtoken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
 
     const user =  await User.findById(decodedtoken?._id).select("-password -refreshtoken")
     if(!user){
         throw new ApiError (401,"Unauthorized , user not found")
     }
 
     req.user = user
     next()
   } catch (error) {
        throw new ApiError (401,"Unauthorized , invalid token")
    
   }


})