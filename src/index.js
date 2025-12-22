    // require('dotenv').config({path:'./env'})
    import dotenv from "dotenv"
    import connectDB from "./db/index.js";


    dotenv.config();
    connectDB()
    .then(()=>{
        app.listen(process.env.PORT|| 8000,()=>{
            console.log(`SERVER IS LISTENING FROM THE PORT : ${process.env.PORT}`)

        })
    })
    .catch((err)=>{
        console.log("MONGO DB CONNECTION FAILED ,",err);
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