import Appointment from "../models/Appointment.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const requestAppointment = asyncHandler(async (req, res) => {
    try {
      const { studentName, parentName, email, phone, date, time, message } = req.body;
      console.log(req.body);
  
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
  await Student.findByIdAndUpdate(
      req.user._id,
      { new: true }
  );

  return res
      .status(200)
      .clearCookie("accessToken")
      .json(new ApiResponse(200, { student : req.user.studentId }, "Student/Parent logged out!"));
});


export { requestAppointment,loginStudent,logoutStudent };