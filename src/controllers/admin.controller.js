import { Employee } from "../models/Employee.js";
import {Appointment} from "../models/Appointment.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {asyncHandler} from "../utils/asyncHandler.js";
import { Designation } from "../models/Designation.js";
import { Department } from "../models/Department.js";
import { Program } from "../models/Program.js";
import { Diagnosis } from "../models/Diagnosis.js";
import { Student } from "../models/Student.js";
import { Enrollment } from "../models/Enrollments.js";
import { sendSMS } from "../utils/phone.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { JobApplication } from "../models/JobApplication.js";


const updateEmployee=asyncHandler(async(req,res,next)=>{
    const {empId,designation,department}=req.body;
})

const updateJobApplication = asyncHandler(async (req, res, next) => {
    const { jobId,progress } = req.body; // Only progress should be updated

    try {
        // Validate request
        if (!progress) {
            return res.status(400).json({ message: "Progress field is required" });
        }

        if (!["Applied", "Under_Review", "Rejected", "Hired"].includes(progress)) {
            return res.status(400).json({ message: "Invalid progress value" });
        }

        // Find job application
        const jobApplication = await JobApplication.findOne({ jobId });

        if (!jobApplication) {
            return res.status(404).json({ message: "Job application not found" });
        }

        // Update progress
        jobApplication.progress = progress;
        await jobApplication.save();

        // If progress is changed to "Hired", add employee to Employee collection
        if (progress === "Hired") {
            const existingEmployee = await Employee.findOne({ email: jobApplication.email });

            if (existingEmployee) {
                return res.status(400).json({ message: "Employee already exists with this email" });
            }
            const employeeID = await Employee.generateEmployeeID();
            const newEmployee = new Employee({
                employeeID,
                firstName: jobApplication.firstName,
                lastName: jobApplication.lastName,
                gender: jobApplication.gender,
                email: jobApplication.email,
                phoneNumber: jobApplication.phoneNumber,
                employmentType: jobApplication.employmentType,
                address:jobApplication.address,
                dateOfJoining: new Date(), // Set joining date to current date
                role: "employee"
            });

            await newEmployee.save();
        }

        res.status(200).json({
            success: true,
            message: `Job application updated successfully. Progress changed to ${progress}.`
        });

    } catch (error) {
        next(error);
    }
});

const getJobApplications = asyncHandler(async (req, res, next) => {
    try {
        // Fetch all job applications from the database
        const jobApplications = await JobApplication.find();

        // If no applications are found, return a message
        if (!jobApplications || jobApplications.length === 0) {
            return res.status(404).json({ message: "No job applications found" });
        }

        // Return the list of job applications
        res.status(200).json({
            success: true,
            count: jobApplications.length,
            jobApplications
        });

    } catch (error) {
        // Handle unexpected errors
        next(error);
    }
});

const getEnrollments = asyncHandler(async (req, res, next) => {
    // populate student, programs, educator, secondaryEducator, sessions
    // ignore createdAt, updatedAt, __v in each populate,
    // Order elements by student._id and descending order of level and updatedAt
    const enrollments = await Enrollment.find({})
        .select("-createdAt -updatedAt -__v")
        .populate({
            path: "student",
            select: "studentID firstName lastName gender photo primaryDiagnosis comorbidity",
            populate: [
                {
                    path: "primaryDiagnosis",
                    select: "diagnosisID name"
                },
                {
                    path: "comorbidity",
                    select : "diagnosisID name"
                }
            ]
        })
        .populate({
            path: "programs",
            select: "name "
        })
        .populate({
            path: "educator",
            select: "employeeID firstName lastName gender photo"
        })
        .populate({
            path: "secondaryEducator",
            select: "employeeID firstName lastName gender photo"
        })
        // .populate("sessions", "-createdAt -updatedAt -__v") // uncomment this when session model is registered
        .sort({ "student": 1, level: -1, updatedAt: -1 })
        .lean();

    if(enrollments.length === 0){
        return res.status(200).json(new ApiResponse(200, { enrollments: [] }, "No enrollments found"));
    }
    
    return res.status(200).json(new ApiResponse(200, { enrollments }, "Enrollments fetched successfully"));
})


const enrollStudent = asyncHandler(async (req, res, next) => {
    const { student_id, program_ids, educator_id, secondaryEducator_id, level, status , sessions } = req.body;

    const existStudent = await Student.findById(student_id);

    if(!existStudent){
        throw new ApiError(404, "Student not found");
    }
    
    // check if programs is an >0
    if(program_ids.length === 0){
        throw new ApiError(400, "Programs are required");
    }

    // check for each program in programs model
    for(const programId of program_ids){
        const existProgram = await Program.findById(programId);
        if(!existProgram){
            throw new ApiError(404, `Program with id ${programId} not found`);
        }
    }

    // check if employee exists in employee model
    const existEducator = await Employee.findById(educator_id);
    if(!existEducator){
        throw new ApiError(404, "Educator not found");
    }

    // check if secondary educator exists in employee model
    if(secondaryEducator_id){
        const existSecondaryEducator = await Employee.findById(secondaryEducator_id);
        if(!existSecondaryEducator){
            throw new ApiError(404, "Secondary educator not found");
        }
    }

    // check if level is a number and greater than 0
    if(typeof level !== "number" || level <= 0){
        throw new ApiError(400, "Invalid level");
    }

    // check if status is valid
    const validStatus = ["Active", "Inactive", "Completed"];
    if(!validStatus.includes(status)){
        throw new ApiError(400, "Invalid status");
    }

    // save enrollment in db
    const enrollment = await Enrollment.create({ 
        student: student_id, 
        programs: program_ids, 
        educator: educator_id, 
        secondaryEducator: secondaryEducator_id, 
        level, 
        status 
    });

    // Fix population to match schema relationships
    await enrollment.populate([
        { path: "student", select: "_id name" },
        { path: "programs", select: "_id name" },
        { path: "educator", select: "_id name photo" },
        { path: "secondaryEducator", select: "_id name photo" }
    ]);

    return res
    .status(200)
    .json(new ApiResponse(200, { enrollment }, "Student enrolled successfully"));
})

const addStudent = asyncHandler(async (req, res, next) => {
    const {
        uuid,
        firstName,
        lastName,
        gender,
        dob,
        bloodGroup,
        allergies,
        phoneNumber,
        secondaryPhoneNumber,
        email,
        parentEmail,
        fatherName,
        motherName,
        address,
        transport,
        strengths,
        weaknesses,
        comments,
        primaryDiagnosis,
        comorbidity,
        enrollmentDate
    } = req.body;

    // Add validation and logic to create a new student, for each field
    // In error message, mention the field name
    const requiredFields = [
        { field: firstName, name: 'firstName' },
        { field: gender, name: 'gender' },
        { field: dob, name: 'dob' },
        { field: bloodGroup, name: 'bloodGroup' },
        { field: phoneNumber, name: 'phoneNumber' },
        { field: email, name: 'email' },
        { field: parentEmail, name: 'parentEmail' },
        { field: fatherName, name: 'fatherName' },
        { field: motherName, name: 'motherName' },
        { field: primaryDiagnosis, name: 'primaryDiagnosis' }
    ];

    const missingFields = requiredFields
        .filter((obj) => !obj.field)
        .map((obj) => obj.name);

    if (missingFields.length > 0) {
        throw new ApiError(400, `Missing required fields: ${missingFields.join(', ')}`);
    }

    //add field specific validation
    // gender validation , use array of valid genders
    const validGenders = ["Male", "Female", "Other"];
    if(!validGenders.includes(gender)){
        throw new ApiError(400, "Invalid gender");
    }

    // blood group validation , use array of valid blood groups
    const validBloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
    if(!validBloodGroups.includes(bloodGroup)){
        throw new ApiError(400, "Invalid blood group");
    }

    // phone number validation , length should be 10    
    if(phoneNumber.length !== 10){
        throw new ApiError(400, "Invalid phone number");
    }

    // primary diagnosis validation, check from db use _id
    const primaryDiagnosisExists = await Diagnosis.findById(primaryDiagnosis);
    if(!primaryDiagnosisExists){
        throw new ApiError(400, "Invalid primary diagnosis");
    }

    let comorbidityArray;
    if(comorbidity){
        if(typeof comorbidity === "string"){
            comorbidityArray = [comorbidity];
        }
        else{
            comorbidityArray = comorbidity;
        }

        // comorbidity validation, check from db use _id for each {_id } in commorbidity array
        if(!Array.isArray(comorbidityArray)){
            throw new ApiError(400, "Comorbidity must be an array");
        }

        if(comorbidityArray.length > 0){
            for(const c of comorbidityArray){
                const comorbidityExists = await Diagnosis.findById(c);
                // console.log(comorbidityExists);
                if(!comorbidityExists){
                    throw new ApiError(400, "Invalid comorbidity");
                }
            }
        }
    }
    
    if(email){
        const existingStudent = await Student.findOne({email});
        if(existingStudent){
            throw new ApiError(400, "Student already exists with this email");
        }
    }

    const photo = req.file;
    // console.log(photo);
    let photoUrl;
    if(photo){
        const uploadResponse = await uploadOnCloudinary(photo.path);
        if(!uploadResponse){
            throw new ApiError(400, "Photo upload failed");
        }
        photoUrl = uploadResponse.url;
    }

    // create student in db
    const studentID = await Student.generateStudentID();

    // after creating student, return new student object

    try{
        const student = await Student.create({
            uuid,
            studentID,
            firstName,
            lastName,
            gender,
            dob,
            bloodGroup,
            allergies,
            phoneNumber,
            secondaryPhoneNumber,
            email,
            parentEmail,
            fatherName,
            motherName,
            address,
            transport,
            strengths,
            weaknesses,
            comments,
            primaryDiagnosis,
            comorbidity,
            photo: photoUrl,
            enrollmentDate
        });
    }catch(error){
        console.log(error);
        throw new ApiError(400, "Student creation failed");
    }
    // Example response
    return res.status(201).json(new ApiResponse(201, { student }, "Student added successfully"));
});

const getAppointments = asyncHandler(async (req,res,next)=>{
    const appointments = await Appointment.find({})
        .populate("employee", "_id name email") // only sepeficic fields
        .sort({ createdAt: -1 });
    
    if (appointments.length === 0) {
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    { appointments: [] },
                    "No appointments available"
                )
            );
    }
    
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { appointments },
                "Appointments fetched successfully"
            )
        );
})

const scheduleAppointment = asyncHandler(async (req, res, next) => {
    // get appointment id from request body
    const { appointmentId } = req.body;

    // find appointment by id
    const appointment = await Appointment.findById(appointmentId);  

    if(!appointment){
        throw new ApiError(404, "Appointment not found");
    }
    
    // check status of appointment
    if(appointment.status === "scheduled"){
        // send response that appointment is already scheduled
        return res.status(200).json(new ApiResponse(200, { appointment }, "Appointment already scheduled"));
    }

    // get date and time from body and convert to date and timeSchema object, update appointment,if not same as earlier
    const { date, time } = req.body;
    const appointmentDate = new Date(date);
    const appointmentTime = {hr:time.hr, min:time.min};

    // check if date is present or not  
    if(appointmentDate){
        appointment.date = appointmentDate;
    }

    // check if time is present or not
    if(appointmentTime){
        appointment.time = appointmentTime; 
    }

    // assign employee to appointment 
    // get employee id from request body
    const { employeeId } = req.body;

    // find employee by id
    const employee = await Employee.findOne({employeeID: employeeId});

    if(!employee){
        throw new ApiError(404, "Employee not found");
    }

    // Assign employee to appointment
    appointment.employee = employee._id;

    // TODO :  send email to employee and Parent

    appointment.status = "scheduled";
    await appointment.save();
    return res.status(200).json(new ApiResponse(200, { appointment }, "Appointment scheduled successfully"));
})

const updateAppointment = asyncHandler(async (req, res, next) => {
    const { appointmentId, verdict, remarks ,status } = req.body;

    const appointment = await Appointment.findById(appointmentId);

    if(!appointment){
        throw new ApiError(404, "Appointment not found");
    }

    // update status,remarks,verdict

    // check if status is present or not
    if(status){
        // check if status is valid or not
        if(status !== "pending" && status !== "scheduled" && status !== "completed"){
            throw new ApiError(400, "Invalid status");
        }
        appointment.status = status;
    }
    // check if remarks is present or not
    if(remarks){
        appointment.remarks = remarks;
    }
    // check if verdict is present or not
    if(verdict){
        // check if verdict is valid or not
        if(verdict !== "joined" && verdict !== "recommendation"){
            throw new ApiError(400, "Invalid verdict");
        }
        appointment.verdict = verdict;
    }
    await appointment.save();

    return res.status(200).json(new ApiResponse(200, { appointment }, "Appointment updated successfully"));
})


const addEmployee = asyncHandler(async (req, res, next) => {
    // Extract employee data from request body
    const {
        firstName,
        lastName,
        gender,
        email,
        phoneNumber,
        address,
        employmentType,
        dateOfJoining,
        workLocation,
        comments,
        designation,
        department,
        programs,
        highestQualification
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !gender || !email || !phoneNumber) {
        throw new ApiError(400, "All required fields must be provided");
    }

    // Check if employee with the same email already exists
    const existingEmployee = await Employee.findOne({ email });
    if (existingEmployee) {
        throw new ApiError(409, "Employee with this email already exists");
    }
    // Validate designation exists (assuming you have Designation model imported)
    if (designation) {
        const designationExists = await Designation.findById(designation);
        if (!designationExists) {
            throw new ApiError(400, "Invalid designation title");
        }
    }
    

    // Validate department exists (assuming you have Department model imported)
    if (department) {
        const departmentExists = await Department.findById(department);
        if (!departmentExists) {
            throw new ApiError(400, "Invalid department name");
        }
    }
    

    // Validate programs exist (assuming you have Program model imported)
    if (programs && programs.length > 0) {
        for (const programId of programs) {
            const programExists = await Program.findById(programId);
            if (!programExists) {
                throw new ApiError(400, `Invalid program ID: ${programId}`);
            }
        }
    }

    // Create the new employee
    const employeeID = await Employee.generateEmployeeID();
    const employee = await Employee.create({
        employeeID,
        firstName,
        lastName,
        gender,
        email,
        phoneNumber,
        address,
        employmentType,
        dateOfJoining: dateOfJoining ? new Date(dateOfJoining) : undefined,
        workLocation,
        comments,
        designation,
        department,
        programs,
        highestQualification
    });

    // Populate the referenced fields for the response
    const populatedEmployee = await Employee.findById(employee._id)
        .populate("designation", "title")  // Only fetch title from designation
        .populate("department", "name")    // Only fetch name from department
        .populate("programs", "name");     // Only fetch name from programs

    // Return success response
    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                { employee: populatedEmployee },
                "Employee added successfully"
            )
        );
});

const getDepartments = asyncHandler(async (req, res, next) => {
    const departments = await Department.find({}).sort({ name: 1 });
    
    if (departments.length === 0) {
        return res  
            .status(200)
            .json(
                new ApiResponse(200, { departments: [] }, "No departments available")
            );
    }   

    return res
        .status(200)
        .json(
            new ApiResponse(200, { departments }, "Departments fetched successfully")
        );
});
const addDepartment = asyncHandler(async (req, res, next) => {
    const { name, description } = req.body;

    const departmentID = await Department.generateDepartmentID();

    const department = await Department.create({ departmentID, name, description });  

    return res
        .status(201)
        .json(
            new ApiResponse(201, { department }, "Department added successfully")
        );
});


const getDesignations = asyncHandler(async (req, res, next) => {
    const designations = await Designation.find({}).sort({ title: 1 });
    
    if (designations.length === 0) {
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    { designations: [] },
                    "No designations available"
                )
            );
    }
    
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { designations },
                "Designations fetched successfully"
            )
        );
});
const addDesignation = asyncHandler(async (req, res, next) => {
    const { title, description } = req.body;

    // Generate the designationID explicitly
    const designationID = await Designation.generateDesignationID();
    
    const designation = await Designation.create({ 
        designationID,
        title, 
        description 
    });

    return res
        .status(201)
        .json(
            new ApiResponse(201, { designation }, "Designation added successfully")
        );
}); 

const getDiagnoses = asyncHandler(async (req, res, next) => {
    const diagnoses = await Diagnosis.find({}).sort({ name: 1 });
    
    if (diagnoses.length === 0) {
        return res
            .status(200)    
            .json(
                new ApiResponse(200, { diagnoses: [] }, "No diagnoses available")
            );
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, { diagnoses }, "Diagnoses fetched successfully")
        );
}); 
const addDiagnosis = asyncHandler(async (req, res, next) => {
    const { name, category, description } = req.body;

    if (!name || !category) {
        throw new ApiError(400, "Name and category are required fields");
    }

    const diagnosisID = await Diagnosis.generateDiagnosisID();

    const diagnosis = await Diagnosis.create({ diagnosisID, name, category, description });

    return res
        .status(201)
        .json(
            new ApiResponse(201, { diagnosis }, "Diagnosis added successfully")
        );
}); 

const getPrograms = asyncHandler(async (req, res, next) => {
    const programs = await Program.find({}).sort({ name: 1 });
    
    if (programs.length === 0) {
        return res
            .status(200)    
            .json(
                new ApiResponse(200, { programs: [] }, "No programs available")
            );
    }

    return res
        .status(200)    
        .json(
            new ApiResponse(200, { programs }, "Programs fetched successfully")
        );
});
const addProgram = asyncHandler(async (req, res, next) => {
    const { name, description } = req.body;

    const programID = await Program.generateProgramID();

    const program = await Program.create({ programID, name, description });

    return res
        .status(201)
        .json(
            new ApiResponse(201, { program }, "Program added successfully")
        );
});


const loginAdmin = asyncHandler(async (req, res, next) => {

    // make it for both email and emplyoeID -> Do it chatgpt
    const { email, password } = req.body;

    if (!email) {
        throw new ApiError(400, "Email is required!");
    }

    const employee = await Employee.findOne({ email });

    if (!employee) {
        throw new ApiError(404, "Admin does not exist");
    }

    if (employee.role != "admin"){
        throw new ApiError(404, "UnAuthorized Employee")
    }

    const isPasswordValid = await employee.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid Admin credentials!");
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
                { employee: employee.email, accessToken },
                "Admin logged in successfully"
            )
        );
});

const logoutAdmin = asyncHandler(async (req, res, next) => {
    return res
        .status(200)
        .clearCookie("accessToken")
        .json(new ApiResponse(200,"Admin logged out!"));
});

const getAllEmployees=asyncHandler(async(req,res,next)=>{
    const Employees = await Employee.find({}).sort({ name: 1 });
    
    if (Employees.length === 0) {
        return res
            .status(200)    
            .json(
                new ApiResponse(200, { Employees: [] }, "No Employees available")
            );
    }

    return res
        .status(200)    
        .json(
        new ApiResponse(200, { Employees }, "Employees fetched successfully")
    );
})

const getAllStudents=asyncHandler(async(req,res,next)=>{
    const Students = await Student.find({}).sort({ name: 1 });
    
    if (Students.length === 0) {
        return res
            .status(200)    
            .json(
                new ApiResponse(200, { Students: [] }, "No Employees available")
            );
    }

    return res
        .status(200)    
        .json(
        new ApiResponse(200, { Students }, "Employees fetched successfully")
    );
})


const sendSMSAdmin = async (req, res) => {
    try {
      const { to,body } = req.body; // Get message text from request
  
      if (!body) {
        return res.status(400).json({ error: "Message body is required" });
      }
      if (!to) {
        return res.status(400).json({ error: "Phone Number is required" });
      }
  
      const messageId = await sendSMS(to,body);
  
      res.status(200).json({
        success: true,
        message: "Message sent successfully",
        messageId,
      });
    } catch (error) {
      res.status(500).json({
        error: "Failed to send message",
        details: error.message,
      });
    }
  };

export { 
    getAppointments, 
    loginAdmin, 
    logoutAdmin, 
    addEmployee,
    getDepartments,
    addDepartment, 
    getDesignations,
    addDesignation, 
    getDiagnoses,
    addDiagnosis, 
    getPrograms,
    addProgram ,
    scheduleAppointment,
    updateAppointment,
    getAllEmployees,
    getAllStudents,
    addStudent,
    enrollStudent,
    getEnrollments,
    sendSMSAdmin,
    getJobApplications,
    updateJobApplication,
    updateEmployee
};