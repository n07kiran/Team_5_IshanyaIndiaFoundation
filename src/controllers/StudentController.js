import {Appointment} from "../models/Appointment.js";
import { asyncHandler } from "../utils/asyncHandler.js";



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

  const student = await Student.findOne({ studentId });

  if (!student) {
      throw new ApiError(404, "student does not exist");
  }

  const isPasswordValid = await student.isPasswordCorrect(password);

  if (!isPasswordValid) {
      throw new ApiError(401, "Invalid student credentials!");
  }

  const accessToken = await Student.generateAccessToken();

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
              { student : student.studentId, accessToken },
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


export { requestAppointment,loginStudent,logoutStudent };