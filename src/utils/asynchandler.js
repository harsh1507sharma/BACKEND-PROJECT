const asynchandler = (requesthandler)=>{
    (req,res,next)=>{
        Promise.resolve(requesthandler(req,res,next)).catch((err)=>next(err))
    }
}

export {asynchandler}
// PROMISE APPRAOCH



// TRY CATCH APPROACH



// const asynchandler = (fn)=> async (req,res,next) =>{
//     try {
//         await fn(req,res,next)
        
//     } catch (error) {
//         res.status(err.code||500).json({
//             success : false,
//             message : err.message
//         })
        
//     }
// }
