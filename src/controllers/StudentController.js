import {Appointment} from "../models/Appointment.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Student } from "../models/Student.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const getStudent = asyncHandler(async (req, res) => {
  //ignore certain fields : password, createdAt, updatedAt, __v,comments
  const student = await Student.findById(req.user._id).select("-password -createdAt -updatedAt -__v -comments");
  if(!student){
    throw new ApiError(404, "Student not found");
  }
  return res.status(200).json(new ApiResponse(200, { student }, "Student fetched successfully"));
})

const requestAppointment = asyncHandler(async (req, res) => {
    try {
      const { studentName, parentName, email, phone, date, time, message } = req.body;
      console.log(req.body);
  
      // check date and time is not less than current date and time
      const currentDate = new Date();
      const currentHours = currentDate.getHours();
      const currentMinutes = currentDate.getMinutes();
      
      const appointmentDate = new Date(date);
      
      // Compare dates
      if (appointmentDate < new Date(currentDate.setHours(0, 0, 0, 0))) {
        throw new ApiError(400, "Appointment date cannot be in the past");
      }
      
      // If same day, compare time
      if (appointmentDate.getDate() === currentDate.getDate() && 
          appointmentDate.getMonth() === currentDate.getMonth() && 
          appointmentDate.getFullYear() === currentDate.getFullYear()) {
        
        // time is a timeSchema object with hr and min properties
        if (time.hr < currentHours || (time.hr === currentHours && time.min <= currentMinutes)) {
          throw new ApiError(400, "Appointment time cannot be in the past");
        }
      }

      const newAppointment = new Appointment({ studentName, parentName, email, phone, date, time, message });
      await newAppointment.save();
  
      res.status(201).json({ message: "Appointment request submitted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
  })

  
const loginStudent = asyncHandler(async (req, res, next) => {

  const { studentId, password } = req.body;

  if (!studentId) {
      throw new ApiError(400, "studentId is required!");
  }

  const student = await Student.findOne({ studentID:studentId });

  if (!student) {
      throw new ApiError(404, "student does not exist");
  }

  const isPasswordValid = await student.isPasswordCorrect(password);

  if (!isPasswordValid) {
      throw new ApiError(401, "Invalid student credentials!");
  }

  const accessToken = await student.generateAccessToken();

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
              { student : student.studentID, accessToken },
              "Student/Parent logged in successfully"
          )
      );
});


const logoutStudent = asyncHandler(async (req, res, next) => {
  // await Student.findByIdAndUpdate(
  //     req.user._id,
  //     { new: true }
  // );

  return res
      .status(200)
      .clearCookie("accessToken")
      .json(new ApiResponse(200, "Student/Parent logged out!"));
});


export { requestAppointment,loginStudent,logoutStudent,getStudent };