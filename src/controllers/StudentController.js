import {Appointment} from "../models/Appointment.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Student } from "../models/Student.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { sendEmail } from "../utils/Emails.js";
import { appointmentRequestConfirmation } from "../utils/emailTemplates.js";
import { Enrollment } from "../models/Enrollments.js";
import { ScoreCard } from "../models/ScoreCard.js";

const getStudentReports = asyncHandler(async (req, res, next) => {
  try {
    // Find all enrollments for the student, including the associated programs
    const enrollments = await Enrollment.find({ student: req.user._id }).populate('programs', 'name');

    if (!enrollments.length) {
      return res.status(404).json({ message: 'No enrollments found for this student' });
    }

    // Extract enrollment IDs
    const enrollmentIds = enrollments.map(enrollment => enrollment._id);
    // Fetch all scorecards linked to these enrollments
    const scoreCards = await ScoreCard.find({ enrollment_id: { $in: enrollmentIds } })
      .populate('skill_area_id', '-_id -createdAt -updatedAt') // Populate skill area details
      .populate('sub_task_id', '-_id')
      .select('year month week score description'); // Populate sub-task details

    res.status(200).json({ success: true, scoreCards });
  } catch (error) {
    next(error);
  }
});

const getStudent = asyncHandler(async (req, res) => {
  //ignore certain fields : password, createdAt, updatedAt, __v,comments
  const student = await Student.findById(req.user._id)
    .select("-password -createdAt -updatedAt -__v -comments -enrollmentDate -resetPasswordAttempts")
    .populate([
        { path: "primaryDiagnosis" }, // Populating primary diagnosis details
        { path: "comorbidity" } // Populating comorbidities array
    ]);

    const enrollment = await Enrollment.findOne({ student: req.user._id })
    .populate([
        { path: "programs" }, // Fetching enrolled programs
        { 
            path: "educator", 
            select: "firstName phoneNumber" // Fetching only firstName and phoneNumber
        }, 
        { 
            path: "secondaryEducator", 
            select: "firstName phoneNumber" // Fetching only firstName and phoneNumber
        } // Fetching session details
    ]);
  if(!student){
    throw new ApiError(404, "Student not found");
  }
  return res.status(200).json(new ApiResponse(200, { student,enrollment }, "Student fetched successfully"));
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

      // send email to parent
      const mailDetailsToParent = {
        toAddresses: [email],
        subject: "Appointment Request Submitted - Ishanya Foundation",
        html: appointmentRequestConfirmation(newAppointment)
      };

      try {
        await sendEmail(mailDetailsToParent);
      } catch (error) {
        console.error("Failed to send appointment request confirmation email:", error);
      }
      
  
      res.status(201).json({ message: "Appointment request submitted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
  })

  
const loginStudent = asyncHandler(async (req, res, next) => {

  const { email, password } = req.body;

  if (!email) {
      throw new ApiError(400, "Email is required!");
  }

  const student = await Student.findOne({ email:email });

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
              { student : {_id:student._id, studentID:student.studentID,email:student.email}, accessToken },
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


export { requestAppointment,loginStudent,logoutStudent,getStudent,getStudentReports };