import { Employee } from "../models/Employee.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {asyncHandler} from "../utils/asyncHandler.js";
import { Appointment } from "../models/Appointment.js";
import { Enrollment } from "../models/Enrollments.js";

const getEnrollments = asyncHandler(async (req, res, next) => {
    const educatorId = req.user._id;

    const enrollments = await Enrollment.find({
        $or: [
            { educator: educatorId },
            { secondaryEducator: educatorId }
        ],
        status: "Active"
    })
    .select("student programs educator secondaryEducator level status updatedAt")
    .populate([
        {
            path: "student",
            select: "studentID firstName lastName photo",
            populate: [
                {
                    path: "primaryDiagnosis",
                    select: "diagnosisID name -_id"
                },
                {
                    path: "comorbidity",
                    select: "diagnosisID name -_id"
                }
            ]
        },
        {
            path: "programs",
            select: "name -_id"
        },
        {
            path: "educator",
            select: "employeeID firstName lastName -_id"
        },
        {
            path: "secondaryEducator",
            select: "employeeID firstName lastName -_id"
        }
    ])
    .sort({ updatedAt: -1 })
    .lean();

    if(enrollments.length === 0){
        return res
        .status(200).
        json(new ApiResponse(200, { enrollments: [] }, "No enrollments found"));
    }

    return res
    .status(200)
    .json(new ApiResponse(200, { enrollments }, "Enrollments fetched successfully"));

});


const getEmployee = asyncHandler(async (req, res, next) => {
    //ignore certain fields : password, createdAt, updatedAt, comments, role , __v
    const employee = await Employee.findById(req.user._id).select("-password -createdAt -updatedAt -comments -role -__v");
    if(!employee){
        throw new ApiError(404, "Employee not found");
    }

    // populate designation, ignore description, createdAt, updatedAt , __v
    await employee.populate("designation", "-description -createdAt -updatedAt -__v");

    //populate department, ignore description, createdAt, updatedAt , __v
    await employee.populate("department", "-description -createdAt -updatedAt -__v");

    // programs array, ignore description, createdAt, updatedAt , __v , prospectusFile
    await employee.populate("programs", "-description -createdAt -updatedAt -__v -prospectusFile");

    return res.status(200).json(new ApiResponse(200, { employee }, "Employee fetched successfully"));
})

const getAppointments = asyncHandler(async (req, res, next) => {
    const appointments = await Appointment.find({employee : req.user._id}).sort({createdAt: -1});
    if(appointments.length === 0){
        return res.status(200).json(new ApiResponse(200, { appointments: [] }, "No appointments found"));
    }
    return res.status(200).json(new ApiResponse(200, { appointments }, "Appointments fetched successfully"));
})

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
        secure: false,
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, cookieOptions)
        .json(
            new ApiResponse(
                200,
                { employee: {_id: employee._id}, accessToken },
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

export { 
    loginEmployee, logoutEmployee,
    getAppointments,
    getEmployee,
    getEnrollments
 };