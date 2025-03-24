import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Employee } from "../models/Employee.js";
import { Student } from "../models/Student.js";
import { generateHashedPassword } from "../utils/Password.js";
import crypto from "crypto";
import { sendEmail } from "../utils/Emails.js";

function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000);
}

const sendPasswordResetOTP = asyncHandler(async (req, res) => {
    const { email } = req.body;
    
    if (!email) {
        throw new ApiError(400, "Email is required");
    }

    const user = await Employee.findOne({ email }) || await Student.findOne({ email });
    
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    if (user.resetPasswordAttempts >= 5) {
        throw new ApiError(429, "Too many attempts. Please try again later.");
    }

    const otp = generateOTP();
    const otpExpiry = Date.now() + 10 * 60 * 1000;

    user.resetPasswordOTP = otp;
    user.resetPasswordExpires = otpExpiry;
    await user.save({validateBeforeSave: false});

    await sendEmail({
        toAddresses: [email],
        subject: "Password Reset OTP",
        html: `<p>Hey ${user.role}, Your OTP for password reset is: <strong>${otp}</strong></p>
               <p>Valid for 10 minutes</p>`
    });

    return res.status(200).json(
        new ApiResponse(200, {}, "OTP sent successfully")
    );
});

const resetPasswordWithOTP = asyncHandler(async (req, res) => {
    const { email, otp, newPassword } = req.body;

    if (!email) {
        throw new ApiError(400, "Email is required");
    }
    if (!otp) {
        throw new ApiError(400, "OTP is required");
    }
    if (!newPassword) {
        throw new ApiError(400, "New password is required");
    }

    const user = await Employee.findOne({ email }) || await Student.findOne({ email });
    
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    if (user.resetPasswordOTP !== Number(otp) || Date.now() > user.resetPasswordExpires) {
        user.resetPasswordAttempts += 1;
        await user.save({validateBeforeSave: false});
        throw new ApiError(401, "Invalid or expired OTP");
    }

    user.password = newPassword;
    user.resetPasswordOTP = undefined;
    user.resetPasswordExpires = undefined;
    user.resetPasswordAttempts = 0;
    await user.save({validateBeforeSave: false});

    return res.status(200).json(
        new ApiResponse(200, {}, "Password updated successfully")
    );
});

const changePassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    console.log(oldPassword);
    console.log(newPassword);
    
    if (!req.user?.role) {
        throw new ApiError(400, "Invalid user session");
    }

    const Model = req.user.role === "student" ? Student : Employee;
    console.log(Model);
    const user = await Model.findById(req.user._id);
    console.log(user);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const isPasswordValid = await user.isPasswordCorrect(oldPassword);
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid old password");
    }

    user.password = newPassword;
    await user.save({validateBeforeSave: false});

    return res.status(200).json(
        new ApiResponse(200, {}, "Password changed successfully")
    );
});

export { sendPasswordResetOTP, resetPasswordWithOTP, changePassword }; 