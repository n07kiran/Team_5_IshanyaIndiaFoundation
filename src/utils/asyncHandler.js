const asyncHandler = (fn) => {
    return async (req,res,next)=>{
        try{
            await fn(req,res,next);
        }catch(ApiError){
            const statusCode = ApiError.statusCode && ApiError.statusCode <= 599 && ApiError.statusCode >= 100 ? ApiError.statusCode : 500
            const message = ApiError.message

            console.log("Async handler error : ",message,"\nStatus Code : ",statusCode)

            res.status(statusCode).json({
                success: false,
                message : message
            })
        }
    }
}

export {asyncHandler}
