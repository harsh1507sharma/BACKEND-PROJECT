import { asynchandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/Apiresponse.js";
import { response } from "express";
import { verifyjwt } from "../middlewares/authenticate.middleware.js";
import jwt from "jsonwebtoken";
import mongoose, { get } from "mongoose";



const generateaccessandrefreshtoken = async (userId) => {

    try {
        const user = await User.findById(userId)
        const accesstoken = user.generateaccesstoken()
        const refreshtoken = user.generaterefreshtoken()

        user.refreshToken = refreshtoken
        await user.save({ validateBeforeSave: false })

        return { accesstoken, refreshtoken }


    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating tokens")

    }

}
const registerUser = asynchandler(async (req, res) => {
    // get user details from frontend
    // validation - not null , undefined
    // check if user already exists : usrname , email
    // check for images , avatar
    // upload them to cloudinary, check avatar
    // create  user object - create entry in db
    // remove the password and refresh token field from response
    // check if user created successfully
    // return response to frontend

    // console.log("FILES RECEIVED:", req.files);

    const { username, email, password, fullname } = req.body
    console.log("email:", email)
    //  res.staus(201).json({
    //     message: "User registered successfully"
    //     })
    if (fullname === "") {
        throw new ApiError(400, "Fullname is required")
    }
    if (email === "") {
        throw new ApiError(400, "Email is required")
    }
    if (password === "") {
        throw new ApiError(400, "Password is required")
    }
    if (username === "") {
        throw new ApiError(400, "Username is required")
    }


    const existingUser = await User.findOne({
        $or: [{ email }, { username }]
    })
    if (existingUser) {
        throw new ApiError(409, "User with given email/username already exists")
    }


    // const avatarLocalPath = req.files?.avatar?[0]?.path;
    // const coverimageLocalPath = req.files?.coverimage[0]?.path;
    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverimageLocalPath = req.files?.coverimage?.[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar image is required")
    }

    const avatar = await uploadToCloudinary(avatarLocalPath);
    const coverimage = await uploadToCloudinary(coverimageLocalPath);


    if (!avatar) {
        console.log(ApiError)
        throw new ApiError(500, "Unable to upload avatar image , please try again later")

    }

    const user = await User.create({
        username,
        password,
        fullname,
        email,
        avatar: avatar.url,
        coverimage: coverimage?.url || "",
    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")

    }


    return res.status(201).json(
        new ApiResponse(200, "User registered successfully", createdUser)
    )

});

const loginUser = asynchandler(async (req, res) => {
    // req.body => data
    //usrname / email
    // find the user
    // password
    // access and refresh token
    // send cookies and response

    const { email, username, password } = req.body


    if (!username && !email) {
        throw new ApiError(400, "username or password is required")
    }

    const user = await User.findOne({
        $or: [{ email }, { username }]
    })
    if (!user) {
        throw new ApiError(404, "User not found")
    }

    const ispasswordcorrect = await user.isPasswordCorrect(password)

    if (!ispasswordcorrect) {
        throw new ApiError(401, "Invalid credentials")
    }

    const { accesstoken, refreshtoken } = await generateaccessandrefreshtoken(user._id)
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    // send cookies

    const cookieOptions = {
        httpOnly: true,
        secure: true,

    }

    return res.status(200).cookie("refreshtoken", refreshtoken, cookieOptions)
        .cookie("accesstoken", accesstoken, cookieOptions)
        .json(
            new ApiResponse(200, {
                user: loggedInUser,
                accesstoken, refreshtoken
            }, "User logged in successfully")
        )



})

const logoutuser = asynchandler(async (req, res) => {

    await User.findByIdAndUpdate(req.user._id, {
        $set: { refreshToken: undefined }
    })

    const cookieOptions = {
        httpOnly: true,
        secure: true,

    }

    return res.status(200)
        .clearCookie("refreshtoken", cookieOptions)
        .clearCookie("accesstoken", cookieOptions)
        .json(
            new ApiResponse("200", {}, "user logged out successfully")
        )
})

const refreshaccesstoken = asynchandler(async (req, res) => {
    const incomingrefreshtoken = req.cookies.refreshtoken || req.body.refreshtoken
    if (!incomingrefreshtoken) {
        throw new ApiError(401, "Unauthorized , token not found")
    }

    try {
        const decodedToken = jwt.verify(incomingrefreshtoken, process.env.REFRESH_TOKEN_SECRET)

        const user = await User.findById(decodedToken?._id)
        if (!user) throw new ApiError(401, "Unauthorized , user not found")

        if (incomingrefreshtoken !== user?.refreshToken) {
            throw new ApiError(401, "REfersh token is expired or used")
        }


        const cookieOptions = {
            httpOnly: true,
            secure: true,
        }

        const { accesstoken, refreshtoken } = await generateaccessandrefreshtoken(user._id)

        return res
            .status(200)
            .cookie("refreshtoken", refreshtoken, cookieOptions)
            .cookie("accesstoken", accesstoken, cookieOptions)
            .json(
                new ApiResponse(200, {
                    accesstoken, refreshtoken
                }, "Access token refreshed successfully")
            )

    } catch (error) {
        throw new ApiError(401, "Unauthorized , invalid token")

    }



})

const changecurrentpassword = asynchandler(async (req, res) => {
    const { oldpassword, newpassword } = req.body
    const user = await User.findById(req.user?._id)
    const ispassokay = await user.isPasswordCorrect(oldpassword)
    if (!ispassokay) {
        throw new ApiError(400, "Old password is incorrect")
    }

    user.password = newpassword
    await user.save({ validateBeforeSave: false })

    return res.status(200).json(new ApiResponse(
        200, {}, "password changed successfully"
    ))

})

const getcurrentuser = asynchandler(async (req, res) => {
    return res.status(200).json(new ApiResponse(
        200, {
        user: req.user
    }, "Current user fetched successfully"
    ))

})

const updateaccountdeatail = asynchandler(async (req, res) => {

    const { fullname, email } = req.body

    if (!fullname || !email) {
        throw new ApiError(400, "fullname and email are required")
    }
    const user = await User.findByIdAndUpdate(req.user._id,
        {
            $set: { fullname, email }
        },
        { new: true }
    ).select("-password")


    return res.status(200).json(new ApiResponse(
        200, { user }
        , "User details updated successfully"
    ))


})
const avatarupdate = asynchandler(async (req, res) => {
    const avatarLocalPath = req.file?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar image is required")
    }

    const avatar = await uploadToCloudinary(avatarLocalPath);

    if (!avatar.url) {
        throw new ApiError(400, "error while uploading avatar")
    }
    await User.findByIdAndUpdate(req.user._id, {
        $set: { avatar: avatar.url }
    },
        { new: true }
    ).select("-password")

    return res.status(200).json(new ApiResponse(
        200, {}, "Avatar updated successfully"
    ))



})

const coverimageupdate = asynchandler(async (req, res) => {
    const coverimageLocalPath = req.file?.path;

    if (!coverimageLocalPath) {
        throw new ApiError(400, "Cover image is required")
    }

    const coverimage = await uploadToCloudinary(coverimageLocalPath);

    if (!coverimage.url) {
        throw new ApiError(400, "error while uploading cover image")
    }
    const updatecover = await User.findByIdAndUpdate(req.user._id, {
        $set: { coverimage: coverimage.url }
    },
        { new: true }
    ).select("-password")
    return res.status(200).json(new ApiResponse(
        200, { updatecover }, "Cover image updated successfully"
    ))



})

const useraccountcontroller = asynchandler(async (req, res) => {

    const { username } = req.params
    if (!username?.trim()) {
        throw new ApiError(400, "Username is required")
    }

    const channel = await User.aggregate([{
        $match: { username: username }
    },
    {
        $lookup: {
            from: "subscriptions",
            localField: "_id",
            foreignField: "channel",
            as: "subscribers"
        }
    },
    {
        $lookup: {
            from: "subscriptions",
            localField: "_id",
            foreignField: "subscriber",
            as: "subscriptions"
        }
    },
    {
        $addFields: {
            subscriberscount: { $size: "$subscribers" },
            subscriptionscount: { $size: "$subscriptions" },
            isSubscribed: {
                $condition: {
                    if: { $in: [req.user._id, "$subscribers.subscriber"] },
                    then: true,
                    else: false
                }

            }
        },

    },

    {
        $project: {
            fullname: 1,
            username: 1,
            email: 1,
            avatar: 1,
            coverimage: 1,
            subscriberscount: 1,
            subscriptionscount: 1,
            isSubscribed: 1
        }
    }

    ])

    if (!channel?.length) {
        throw new ApiError(404, "channel does not exist ")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, new channel[0], "user channel fetched successfully"))





})

const getwatchhistory = asynchandler(async (req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id)

            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",    
                as: "watchHistory",
                pipeline :[
                    {
                    $lookup :{
                        from : "users",
                        localField : "owner",
                        foreignField : "_id",
                        as : "owner",
                        pipeline : [{
                            $project:{
                                fullname:1,
                                username : 1,
                                avatar : 1
                            }
                        }]
                         

                    }
            },
            {
                $addFields :{
                    owner : {
                        $first : "$owne"
                    }
                }
            }
        ]
            }
        },
    ])

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            user[0].watchHistory,
            "watch history fetched successfully"
        ))
})




export {
    registerUser,
    loginUser,
    logoutuser,
    refreshaccesstoken,
    changecurrentpassword,
    getcurrentuser,
    updateaccountdeatail,
    avatarupdate,
    coverimageupdate,
    useraccountcontroller,
    getwatchhistory
}
