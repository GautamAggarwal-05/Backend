const asynchandler = (requestHandler)=>{
    (req,res,next)=>{
        Promise.resolve(requestHandler(req,res,next))
        .catch((err)=> next(err));
    }
}

export {asynchandler}
// Higher order functions
//wrapper function to use everywhere
// const asynchandler = (requestHandler)=>async(req,res,next) => {
//     try {
//        await requestHandler(req,res,next)
//     } catch (error) {
//         res.status(error.code || 500).json({
//             sucess: false,
//             message: error.message || "Server Error"
//         })
//     }
// }