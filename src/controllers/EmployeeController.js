import { Employee } from "../models/Employee.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import bcrypt from "bcrypt";

const generateAccessAndRefreshTokens = async (employeeId) => {
    try {
        const employee = await Employee.findById(employeeId);
        const accessToken = employee.generateAccessToken();
        const refreshToken = employee.generateRefreshToken();

        employee.refreshToken = refreshToken;
        await employee.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token");
    }
};

const registerEmployee = asyncHandler(async (req, res, next) => {
    const { firstName, lastName, email, password, contact, designation } = req.body;

    if (!firstName || !lastName || !email || !password || !contact || !designation) {
        throw new ApiError(400, "All fields are required!");
    }

    const existingEmployee = await Employee.findOne({ email });
    if (existingEmployee) {
        throw new ApiError(400, "Employee already exists with this email");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const employee = await Employee.create({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        contact,
        designation,
    });

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(employee._id);

    const newEmployee = await Employee.findById(employee._id).select({ password: 0, refreshToken: 0 });

    return res.status(201).json(
        new ApiResponse(201, { employee: newEmployee, accessToken, refreshToken }, "Employee registered successfully")
    );
});

const loginEmployee = asyncHandler(async (req, res, next) => {
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

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(employee._id);

    const loggedInEmployee = await Employee.findById(employee._id).select({ password: 0, refreshToken: 0 });

    const cookieOptions = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .json(
            new ApiResponse(
                200,
                { employee: loggedInEmployee, accessToken, refreshToken },
                "Employee logged in successfully"
            )
        );
});

const logoutEmployee = asyncHandler(async (req, res, next) => {
    await Employee.findByIdAndUpdate(
        req.user._id,
        { $set: { refreshToken: "" } },
        { new: true }
    );

    return res
        .status(200)
        .clearCookie("accessToken")
        .clearCookie("refreshToken")
        .json(new ApiResponse(200, { employee: req.user.email }, "Employee logged out!"));
});

export { registerEmployee, loginEmployee, logoutEmployee, generateAccessAndRefreshTokens };