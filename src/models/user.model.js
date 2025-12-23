import mongoose from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const UserSchema = new mongoose.Schema({

    username :{
        type : String,
        required : true,
        unique : true,
        lowercase : true,
        trim : true,
        index : true
    },
    email :{
        type : String,
        required : true,
        unique : true,
        lowercase : true,
        trim : true,
    },
    fullname :{
        type : String,
        required : true,
        trim : true,
        index :true
    },
    avatar : {
        type: String,// cloudnary url
        required : true,
    },
      fullname :{
        type : String
    },
    watchHistory :{
        type : mongoose.Schema.Types.ObjectId,
        ref : "Video"
    },
    password :{
        type : String,
        required : [true,`Password is required`]

    },
    refreshToken :{
        type:String
    }
    

},{timestamps:true})


UserSchema.pre("save",async function(next){
    if(this.isModified("password")) {
        this.password = bcrypt.hash(this.password, 10)
        next()
    }                                                                   
    
})

UserSchema.methods.isPasswordCorrect = async function 
(password){
       return await bcrypt.compare(password , this.password)


}

UserSchema.methods.generateaccesstoken = function(){
     return jwt.sign(
        {
            _id : this.id,
            email : this.email,
            username : this.username,
            fullname : this.fullname,

        },
        process.env.ACCESS_TOKEN_SECRET,   
        {expiresIn : process.env.ACCESS_TOKEN_EXPIRESIN}                                                 
    )
}
UserSchema.methods.generaterefreshtoken = function(){
     return jwt.sign(
        {
            _id : this.id,
        },
        process.env.REFRESH_TOKEN_SECRET,   
        {expiresIn : process.env.REFRESH_TOKEN_EXPIRESIN}                                                 
    )

}
export const User = mongoose.model("User",UserSchema)