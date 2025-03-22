import jwt from "jsonwebtoken"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { Student } from "../models/Student.js"
import { Employee } from "../models/Employee.js"

export const verifyJWTStudent = asyncHandler(async (req,res,next) => {
    // Bug 1 : After logout,'user' is able to access the "endpoints" with the 'old Access Token' without re-login ! !!!!! 
    const accessToken = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")

    if(!accessToken){
        throw new ApiError(401,"UnAuthorized user")
    }

    const decodedUser = jwt.verify(accessToken,process.env.ACCESS_TOKEN_SECRET_KEY)

    // const user = await User.findById(decodedUser._id).select("-password -createdAt -updatedAt")

    let user;

    if(decodedUser.role == "student" ){
        user = await Student.findById(decodedUser._id)
    }

    if(!user){
        throw new ApiError(401,"Invalid student Access Token")
    }

    req.user = user;
    return next();
})

export const verifyJWTEmployee = asyncHandler(async (req,res,next) => {
    const accessToken = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")

    if(!accessToken){
        throw new ApiError(401,"UnAuthorized user")
    }

    const decodedUser = jwt.verify(accessToken,process.env.ACCESS_TOKEN_SECRET_KEY)

    let user = null;

    if(decodedUser.role == "employee" ){
        user = await Employee.findById(decodedUser._id)
    }
    
    // console.log(user)

    if(!user){
        throw new ApiError(401,"Invalid employee Access Token")
    }

    req.user = user;
    return next();
})

export const verifyJWTAdmin = asyncHandler(async (req,res,next) => {
    const accessToken = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")

    if(!accessToken){
        throw new ApiError(401,"UnAuthorized Admin")
    }

    const decodedUser = jwt.verify(accessToken,process.env.ACCESS_TOKEN_SECRET_KEY)

    let user;

    if(decodedUser.role == "admin" ){
        user = await Employee.findById(decodedUser._id)
    }

    if(!user){
        throw new ApiError(401,"Invalid admin Access Token")
    }   

    req.user = user;
    return next();
})