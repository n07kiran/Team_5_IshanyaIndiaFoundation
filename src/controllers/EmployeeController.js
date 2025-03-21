import { Employee } from "../models/Employee.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {asyncHandler} from "../utils/asyncHandler.js";

const loginEmployee = asyncHandler(async (req, res, next) => {
    // make it for both email and emplyoeID -> Do it chatgpt
    const { email, password } = req.body;

    if (!email) {
        throw new ApiError(400, "Email is required!");
    }

    const employee = await Employee.findOne({ email });

    if (!employee) {
        throw new ApiError(404, "Employee does not exist");
    }

    const isPasswordValid = await employee.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid employee credentials!");
    }

    const accessToken = await employee.generateAccessToken();

    const cookieOptions = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, cookieOptions)
        .json(
            new ApiResponse(
                200,
                { employee: employee.email, accessToken },
                "Employee logged in successfully"
            )
        );
});

const logoutEmployee = asyncHandler(async (req, res, next) => {
    await Employee.findByIdAndUpdate(
        req.user._id,
        { new: true }
    );

    return res
        .status(200)
        .clearCookie("accessToken")
        .json(new ApiResponse(200, { employee: req.user.email }, "Employee logged out!"));
});

export { loginEmployee, logoutEmployee };