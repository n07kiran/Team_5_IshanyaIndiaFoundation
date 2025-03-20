const generateAccessAndRefreshTokens = async (userId) => {
    try{
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save( { validateBeforeSave : false })

        return {accessToken,refreshToken}
    }catch(error){
        throw new ApiError(500,"Something went wrong while generating refresh and access token")
    }
}

const loginUser = asyncHandler(async (req,res,next)=>{
    // 1. get the username and password from the frontend : req.body -> data
    // 2. search for existing user and compare the password : username or email , 
    // 3. if true : generate access and refresh token and send it in secure cookies
    // 4. if false : inValid
    // 5. send response

    const {username,email,password} = req.body

    if(!username && !email){
        throw new ApiError(400,"Username or email is required!")
    }

    const user = await User.findOne({
        $or : [{email : email},{username: username}]
    })

    if(!user){
        throw new ApiError(404,"User does not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(401,"Invalid user credentials!")
    }
    // console.log("Valid Password!")

    const {accessToken,refreshToken} = await generateAccessAndRefreshTokens(user._id)

    // console.log({accessToken : accessToken , refreshToken : refreshToken})
    
    const loggedInUser = await User.findById(user._id).select({password:0,refreshToken:0})

    const cookieOptions = {
        httpOnly : true,
        secure : true
    }

    return res
    .status(200)
    .cookie("accessToken",accessToken,cookieOptions)
    .cookie("refreshToken",refreshToken,cookieOptions)
    .json(
        new ApiResponse(
            200,
            {
                user : loggedInUser,accessToken,refreshToken
            },
            "User logged In Successfully"

        )
    )


})

const logoutUser = asyncHandler(async (req,res,next)=>{
    await User.findByIdAndUpdate(req.user._id,
        {
            $set : {
                refreshToken : ""
            }
        },
        {
            new : true
        })


    const cookieOptions = {
        httpOnly : true,
        secure : true
    }

    return res
    .status(200)
    .clearCookie("accessToken")
    .clearCookie("refreshToken")
    .json(
        new ApiResponse(200,{user : req.user.username   },"User logged out!")
    )

})