import jwt from "jsonwebtoken"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { Student } from "../models/Student.js"
import { Employee } from "../models/Employee.js"

export const verifyJWT = asyncHandler(async (req,res,next) => {
    // Bug 1 : After logout,'user' is able to access the "endpoints" with the 'old Access Token' without re-login ! !!!!! 
    const accessToken = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")

    if(!accessToken){
        throw new ApiError(401,"UnAuthorized user")
    }

    const decodedUser = jwt.verify(accessToken,process.env.ACCESS_TOKEN_SECRET_KEY)

    // const user = await User.findById(decodedUser._id).select("-password -createdAt -updatedAt")

    let user;

    if(decodedUser.designation == "Student" ){
        user = Student.findById(decodedUser._id)
    }
    else{
        user = Employee.findById(decodedUser._id)
    }

    if(!user){
        throw new ApiError(401,"Invalid Access Token")
    }

    req.user = user;
    return next();
})