import { Employee } from "../models/Employee.js";
import {Appointment} from "../models/Appointment.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {asyncHandler} from "../utils/asyncHandler.js";
import { Designation } from "../models/Designation.js";
import { Department } from "../models/Department.js";
import { Program } from "../models/Program.js";
import { Diagnosis } from "../models/Diagnosis.js";



const getAppointments = asyncHandler(async (req,res,next)=>{
    const appointments = await Appointment.find({})
        .populate("employee")
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

const addEmployee = asyncHandler(async (req, res, next) => {
    // Extract employee data from request body
    const {
        firstName,
        lastName,
        gender,
        email,
        contact,
        address,
        employmentType,
        dateOfJoining,
        workLocation,
        comments,
        designation,
        department,
        programs
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !gender || !email || !contact) {
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
            throw new ApiError(400, "Invalid designation ID");
        }
    }

    // Validate department exists (assuming you have Department model imported)
    if (department) {
        const departmentExists = await Department.findById(department);
        if (!departmentExists) {
            throw new ApiError(400, "Invalid department ID");
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
    const employee = await Employee.create({
        firstName,
        lastName,
        gender,
        email,
        contact,
        address,
        employmentType,
        dateOfJoining: dateOfJoining ? new Date(dateOfJoining) : undefined,
        workLocation,
        comments,
        designation,
        department,
        programs
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

    if (employee.designation.title != 'Admin'){
        throw new ApiError(404, "UnAuthorized Employee")
    }

    const isPasswordValid = await employee.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid Admin credentials!");
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
                "Admin logged in successfully"
            )
        );
});

const logoutAdmin = asyncHandler(async (req, res, next) => {
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
    addProgram 
};