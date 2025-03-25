import { Employee } from "../models/Employee.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {asyncHandler} from "../utils/asyncHandler.js";
import { Appointment } from "../models/Appointment.js";
import { Enrollment } from "../models/Enrollments.js";
import {JobApplication} from "../models/JobApplication.js";
import fs from "fs";
import PDFDocument from "pdfkit";
import { cloudinary } from "../utils/cloudinary.js";
import { StudentDocument } from "../models/StudentDoc.js";
import { Student } from "../models/Student.js";


const getReportDetails = asyncHandler(async (req, res, next) => {
    try {
        const { enrollmentId } = req.params;

        // Fetch the enrollment details
        const enrollment = await Enrollment.findById(enrollmentId)
            .populate({ path: "programs", select: "_id name" }); // Fetching only Program ID and name

        if (!enrollment) {
            return res.status(404).json({ message: "Enrollment not found" });
        }

        // Extract program IDs from enrollment
        const programIds = enrollment.programs.map((program) => program._id);

        // Fetch skill areas related to the enrolled programs
        const skillAreas = await SkillArea.find({ program_id: { $in: programIds } })
            .select("_id name description program_id");

        // Extract skill area IDs
        const skillAreaIds = skillAreas.map((skill) => skill._id);

        // Fetch subtasks related to these skill areas
        const subTasks = await SubTask.find({ skill_area_id: { $in: skillAreaIds } })
            .select("_id name description skill_area_id");

        return res.status(200).json({
            programs: enrollment.programs,
            skillAreas,
            subTasks,
        });

    } catch (error) {
        next(error);
    }
});


const uploadReport = asyncHandler(async (req, res) => {
    try {
        const { enrollmentId, reportDate, weekNumber, categories, teacherComments } = req.body;

        if (!enrollmentId || !reportDate || !weekNumber || !categories || !Array.isArray(categories)) {
            throw new Error("Invalid request format. Missing required fields.");
        }

        for (const category of categories) {
            const { categoryId, subTasks } = category;

            if (!categoryId || !subTasks || !Array.isArray(subTasks)) continue;

            for (const subTask of subTasks) {
                const { subTaskId, score, description, week, month } = subTask;

                if (!subTaskId || score === undefined) continue;

                const scoreCardEntry = new ScoreCard({
                    enrollment_id: enrollmentId,
                    skill_area_id: categoryId,
                    sub_task_id: subTaskId,
                    month:month,
                    week: week,
                    score,
                    description
                });

                await scoreCardEntry.save();
            }
        }

        const fileName = `report-${enrollmentId}-week${weekNumber}-${Date.now()}.pdf`;
        const filePath = `uploads/${fileName}`;

        if (!fs.existsSync('uploads')) {
            fs.mkdirSync('uploads', { recursive: true });
        }

        const doc = new PDFDocument({ margins: { top: 50, bottom: 50, left: 50, right: 50 }, size: 'A4' });
        const writeStream = fs.createWriteStream(filePath);
        doc.pipe(writeStream);

        // Color Scheme
        const colors = {
            primary: '#1e3a8a',
            secondary: '#3b82f6',
            accent: '#dbeafe',
            text: '#1f2937',
            lightText: '#6b7280',
            success: '#10b981',
            warning: '#f59e0b',
            danger: '#ef4444',
            background: '#f9fafb'
        };

        // Header
        doc.rect(0, 0, doc.page.width, 120).fill(colors.primary);
        doc.fillColor('white').fontSize(24).font('Helvetica-Bold').text('STUDENT PROGRESS REPORT', 50, 50, { align: 'center' });
        doc.fillColor('white').fontSize(14).font('Helvetica').text(`Week ${weekNumber} - ${reportDate}`, 50, 80, { align: 'center' });

        // Student Info
        doc.rect(50, 130, doc.page.width - 100, 80).fill(colors.accent).stroke(colors.secondary);
        doc.fillColor(colors.text).fontSize(16).font('Helvetica-Bold').text(`Enrollment ID: ${enrollmentId}`, 70, 150);
        doc.fillColor(colors.lightText).fontSize(12).font('Helvetica').text(`Report Date: ${reportDate}`, 70, 175);

        let yPosition = 230;
        let totalScore = 0;
        let totalTasks = 0;

        for (const category of categories) {
            if (yPosition > doc.page.height - 200) {
                doc.addPage();
                yPosition = 50;
            }

            const categoryData = await SkillArea.findById(category.categoryId);
            const categoryName = categoryData ? categoryData.name : 'Unknown Category';

            doc.rect(50, yPosition, doc.page.width - 100, 40).fill(colors.secondary).stroke(colors.secondary);
            doc.fillColor('white').fontSize(14).font('Helvetica-Bold').text(categoryName.toUpperCase(), 70, yPosition + 15);
            yPosition += 50;

            const col1Width = 250;
            const col2Width = 100;

            // Table Headers
            doc.rect(50, yPosition, doc.page.width - 100, 30).fill(colors.accent).stroke(colors.secondary);
            doc.fillColor(colors.text).fontSize(12).font('Helvetica-Bold').text("Subtask", 70, yPosition + 10);
            doc.fillColor(colors.text).fontSize(12).font('Helvetica-Bold').text("Score", 70 + col1Width, yPosition + 10);
            yPosition += 30;

            for (const subTask of category.subTasks) {
                if (yPosition > doc.page.height - 100) {
                    doc.addPage();
                    yPosition = 50;

                    // Table Headers on new page
                    doc.rect(50, yPosition, doc.page.width - 100, 30).fill(colors.accent).stroke(colors.secondary);
                    doc.fillColor(colors.text).fontSize(12).font('Helvetica-Bold').text("Subtask", 70, yPosition + 10);
                    doc.fillColor(colors.text).fontSize(12).font('Helvetica-Bold').text("Score", 70 + col1Width, yPosition + 10);
                    yPosition += 30;
                }

                const subTaskData = await SubTask.findById(subTask.subTaskId);
                const subTaskName = subTaskData ? subTaskData.name : 'Unknown Subtask';

                doc.rect(50, yPosition - 5, doc.page.width - 100, 30).fill(colors.background).stroke(colors.secondary);
                doc.fillColor(colors.text).fontSize(12).font('Helvetica').text(subTaskName, 70, yPosition);

                // Score color-coding
                let scoreColor = colors.text;
                if (subTask.score >= 4) scoreColor = colors.success;
                else if (subTask.score === 3) scoreColor = colors.warning;
                else if (subTask.score <= 2) scoreColor = colors.danger;

                doc.fillColor(scoreColor).fontSize(12).font('Helvetica-Bold').text(`${subTask.score}/5`, 70 + col1Width, yPosition);

                if (subTask.description) {
                    yPosition += 20;
                    doc.fillColor(colors.lightText).fontSize(10).font('Helvetica-Oblique')
                        .text(`Remarks: ${subTask.description}`, 70, yPosition);
                }

                yPosition += 30;
                totalScore += subTask.score;
                totalTasks++;
            }

            yPosition += 10;
        }

        // Rating Section
        doc.rect(50, yPosition, doc.page.width - 100, 60).fill(colors.accent).stroke(colors.secondary);
        doc.fillColor(colors.text).fontSize(14).font('Helvetica-Bold').text("Overall Rating:", 70, yPosition + 15);

        let rating = "Needs Improvement";
        if (totalTasks > 0) {
            const avgScore = totalScore / totalTasks;
            if (avgScore >= 4) rating = "Excellent";
            else if (avgScore >= 3) rating = "Good";
            else if (avgScore >= 2) rating = "Satisfactory";
        }

        doc.fillColor(colors.primary).fontSize(14).font('Helvetica-Bold').text(rating, 200, yPosition + 15);
        yPosition += 60;

        doc.end();

        writeStream.on("finish", async () => {
            try {
                const cloudinaryResponse = await cloudinary.uploader.upload(filePath, {
                    resource_type: "auto",
                    folder: "reports",
                    type: "upload"
                });

                fs.unlinkSync(filePath);

                const sId = await Enrollment.findById(enrollmentId).populate("student");

                const newDocument = new StudentDocument({
                    studentId: sId,
                    documentType: "67e013547a0003be684c01db",
                    filePath: cloudinaryResponse.secure_url,
                    fileName: `Weekly Report - Week ${weekNumber} - ${reportDate}`,
                    metadata: { weekNumber, categories: categories.map(cat => cat.categoryId), reportDate: new Date() }
                });

                await newDocument.save();

                res.json({ success: true, message: "Report uploaded successfully", pdfUrl: cloudinaryResponse.secure_url, documentId: newDocument._id });
            } catch (uploadError) {
                res.status(500).json({ success: false, message: "Error uploading document", error: uploadError.message });
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: "Error processing report", error: error.message });
    }
});

  
import { sendEmail } from "../utils/Emails.js";
import { jobApplicationConfirmation } from "../utils/emailTemplates.js";
import { SubTask } from "../models/SubTask.js";
import { SkillArea } from "../models/SkillArea.js";
import ScoreCard from "../models/ScoreCard.js";

const createJobApplication = asyncHandler(async (req, res) => {
    const {
        firstName,
        lastName,
        email,
        phoneNumber,
        gender,
        yearsOfExperience,
        resumeLink,
        portfolioLink,
        highestQualification,
        howDidYouHearAboutUs,
        employmentType,
        whyJoinUs,
        address
    } = req.body;

    // Validate required fields
    if (
        !firstName || !lastName || !email || !phoneNumber ||
        !gender || !yearsOfExperience || !resumeLink ||
        !highestQualification || !howDidYouHearAboutUs ||
        !employmentType || !whyJoinUs
    ) {
        res.status(400);
        throw new Error("All required fields must be filled");
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        res.status(400);
        throw new Error("Invalid email format");
    }

    // Validate phone number (assuming 10-digit format)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phoneNumber)) {
        res.status(400);
        throw new Error("Invalid phone number format (10 digits required)");
    }

    // Validate gender
    const validGenders = ["Male", "Female", "Other"];
    if (!validGenders.includes(gender)) {
        res.status(400);
        throw new Error("Invalid gender value");
    }

    // Validate highest qualification
    const validQualifications = [
        "Bachelor's Degree",
        "Master's Degree",
        "Ph.D",
        "Teaching Certificate",
        "Other"
    ];
    if (!validQualifications.includes(highestQualification)) {
        res.status(400);
        throw new Error("Invalid highest qualification value");
    }

    // Validate employment type
    const validEmploymentTypes = ["Full-Time", "Part-Time", "Intern"];
    if (!validEmploymentTypes.includes(employmentType)) {
        res.status(400);
        throw new Error("Invalid employment type value");
    }

    // Validate how did you hear about us
    const validSources = [
        "Job Board",
        "Social Media",
        "Referral from Friend/Colleague",
        "Our Website",
        "Other"
    ];
    if (!validSources.includes(howDidYouHearAboutUs)) {
        res.status(400);
        throw new Error("Invalid 'How did you hear about us' value");
    }

    // Auto-generate jobId
    const jobId = await JobApplication.generateJobID();

    // Create a new job application document
    const jobApplication = new JobApplication({
        jobId,
        firstName,
        lastName,
        email,
        phoneNumber,
        gender,
        yearsOfExperience,
        resumeLink,
        portfolioLink,
        highestQualification,
        howDidYouHearAboutUs,
        employmentType,
        whyJoinUs,
        address,
        progress: "Applied" // Default status
    });

    // Save to database
    try {
        const savedApplication = await jobApplication.save();

        // Send confirmation email
        await sendEmail({
            toAddresses: [savedApplication.email],
            subject: "Job Application Received - Ishanya Foundation",
            html: jobApplicationConfirmation(savedApplication)
        });

        res.status(201).json({
            message: "Job application submitted successfully",
            jobApplication: savedApplication
        });
    } catch (error) {
        res.status(500);
        throw new Error("Error saving job application: " + error.message);
    }
});


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
    getEnrollments,
    createJobApplication,
    uploadReport,
    getReportDetails
 };
