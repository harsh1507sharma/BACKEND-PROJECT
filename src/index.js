// require('dotenv').config({path:'./env'})
import dotenv from "dotenv"
dotenv.config();
import connectDB from "./db/index.js";
import app from "./app.js";


console.log("ENV CHECK AT START:", {
    cloud: process.env.CLOUDINARY_CLOUD_NAME,
    key: process.env.CLOUDINARY_API_KEY,
    secret: process.env.CLOUDINARY_API_SECRET ? "SET" : "NOT SET",
});




connectDB()
    .then(() => {
        app.listen(process.env.PORT || 8000, () => {
            console.log(`SERVER IS LISTENING FROM THE PORT : ${process.env.PORT}`)

        })
    })
    .catch((err) => {
        console.log("MONGO DB CONNECTION FAILED ,", err);
    })


/* FIRST APPROACH
(async ()=>{
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error",(error)=>{
            console.log("ERROR:",error);
            throw error
        })

        app.listen(process.env.PORT, ()=>{
            console.log(`App is listening to PORT ${
                process.env.PORT
            }`);
        })
        
    } catch (error) {
        console.log("ERROR :" ,error);
        throw error
        
    }

})()
    */