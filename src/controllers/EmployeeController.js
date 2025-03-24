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


const uploadReport = asyncHandler(async (req, res) => {
    try {
        const { studentId, studentName, reportDate, weekNumber, categories, teacherComments, studentImageUrl } = req.body;
        const jsonData = req.body;

        // Validation
        if (!studentId) {
            return res.status(400).json({ message: "Student ID is required" });
        }

        // Generate filename
        const fileName = `report-${studentId}-week${weekNumber}-${Date.now()}.pdf`;
        const filePath = `uploads/${fileName}`;

        // Ensure uploads directory exists
        if (!fs.existsSync('uploads')) {
            fs.mkdirSync('uploads', { recursive: true });
        }

        // Create PDF document
        const doc = new PDFDocument({
            margins: {
                top: 50,
                bottom: 50,
                left: 50,
                right: 50
            },
            size: 'A4'
        });

        const writeStream = fs.createWriteStream(filePath);
        doc.pipe(writeStream);

        // Professional color scheme
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

        // Header with school logo/branding
        doc.rect(0, 0, doc.page.width, 120).fill(colors.primary);

        // Title and date section
        doc.fillColor('white')
            .fontSize(24)
            .font('Helvetica-Bold')
            .text('STUDENT PROGRESS REPORT', 50, 50, { align: 'center' });

        doc.fillColor('white')
            .fontSize(14)
            .font('Helvetica')
            .text(`Week ${weekNumber} - ${reportDate || new Date().toISOString().split('T')[0]}`, 50, 80, { align: 'center' });

        // Student information section
        doc.rect(50, 130, doc.page.width - 100, 120).fill(colors.accent).stroke(colors.secondary);

        // Student details - adjusted positioning
        const studentInfoX = 70; // Removed studentImageUrl logic

        doc.fillColor(colors.text)
            .fontSize(16)
            .font('Helvetica-Bold')
            .text(`Student: ${studentName || 'Name Not Provided'}`, studentInfoX, 150);

        doc.fillColor(colors.lightText)
            .fontSize(12)
            .font('Helvetica')
            .text(`Student ID: ${studentId}`, studentInfoX, 175);

        doc.fillColor(colors.lightText)
            .fontSize(12)
            .font('Helvetica')
            .text(`Report Date: ${reportDate || new Date().toLocaleDateString()}`, studentInfoX, 195);

        let yPosition = 280;

        // Overall progress summary
        if (jsonData.overallProgress) {
            doc.rect(50, yPosition, doc.page.width - 100, 100).fill('white').stroke(colors.secondary);

            doc.fillColor(colors.primary)
                .fontSize(16)
                .font('Helvetica-Bold')
                .text('OVERALL PROGRESS', 70, yPosition + 20);

            const avgScore = jsonData.overallProgress.weeklyAverage || 0;
            let scoreColor = colors.warning;

            if (avgScore >= 4) {
                scoreColor = colors.success;
            } else if (avgScore <= 2) {
                scoreColor = colors.danger;
            }

            doc.fillColor(colors.text)
                .fontSize(12)
                .font('Helvetica')
                .text(`Weekly Average:`, 70, yPosition + 50);

            doc.fillColor(scoreColor)
                .fontSize(14)
                .font('Helvetica-Bold')
                .text(`${avgScore}/5`, 180, yPosition + 50);

            const change = jsonData.overallProgress.changeFromLastWeek || 0;
            const changeText = change >= 0 ? `+${change}` : `${change}`;
            const changeColor = change >= 0 ? colors.success : colors.danger;

            doc.fillColor(colors.text)
                .fontSize(12)
                .font('Helvetica')
                .text(`Change from Last Week:`, 250, yPosition + 50);

            doc.fillColor(changeColor)
                .fontSize(14)
                .font('Helvetica-Bold')
                .text(changeText, 400, yPosition + 50);

            yPosition += 120;
        }

        // Categories and skills
        if (categories && Array.isArray(categories)) {
            categories.forEach(category => {
                if (yPosition > doc.page.height - 200) {
                    doc.addPage();
                    yPosition = 50;
                }

                doc.rect(50, yPosition, doc.page.width - 100, 40).fill(colors.secondary);

                doc.fillColor('white')
                    .fontSize(14)
                    .font('Helvetica-Bold')
                    .text(category.categoryName.toUpperCase(), 70, yPosition + 15);

                yPosition += 50;

                if (category.subTasks && Array.isArray(category.subTasks)) {
                    const col1Width = 220;
                    const col2Width = 60;
                    const col3Width = 110;

                    doc.rect(50, yPosition, doc.page.width - 100, 30).fill(colors.accent).stroke(colors.secondary);

                    doc.fillColor(colors.text)
                        .fontSize(12)
                        .font('Helvetica-Bold')
                        .text("SKILL", 70, yPosition + 10);

                    doc.fillColor(colors.text)
                        .fontSize(12)
                        .font('Helvetica-Bold')
                        .text("SCORE", 70 + col1Width, yPosition + 10);

                    doc.fillColor(colors.text)
                        .fontSize(12)
                        .font('Helvetica-Bold')
                        .text("RATING", 70 + col1Width + col2Width, yPosition + 10);

                    yPosition += 40;

                    category.subTasks.forEach((task, index) => {
                        if (yPosition > doc.page.height - 100) {
                            doc.addPage();
                            yPosition = 50;
                            doc.rect(50, yPosition, doc.page.width - 100, 30).fill(colors.accent).stroke(colors.secondary);
                            doc.fillColor(colors.text)
                                .fontSize(12)
                                .font('Helvetica-Bold')
                                .text("SKILL", 70, yPosition + 10);
                            doc.fillColor(colors.text)
                                .fontSize(12)
                                .font('Helvetica-Bold')
                                .text("SCORE", 70 + col1Width, yPosition + 10);
                            doc.fillColor(colors.text)
                                .font('Helvetica-Bold')
                                .text("RATING", 7+ col1Width + col2Width, yPosition + 10);
                                yPosition += 40;
                            }
    
                            const isEvenRow = index % 2 === 0;
                            const rowHeight = task.description ? 60 : 30;
    
                            doc.rect(50, yPosition - 5, doc.page.width - 100, rowHeight)
                                .fill(isEvenRow ? 'white' : colors.background)
                                .stroke(colors.secondary);
    
                            doc.fillColor(colors.text)
                                .fontSize(11)
                                .font('Helvetica')
                                .text(task.subTaskName, 70, yPosition, {
                                    width: col1Width - 10,
                                    ellipsis: true
                                });
    
                            doc.fillColor(colors.text)
                                .fontSize(11)
                                .font('Helvetica-Bold')
                                .text(`${task.score}/5`, 70 + col1Width, yPosition);
    
                            let ratingColor;
                            let ratingText;
    
                            if (task.score === 5) {
                                ratingColor = colors.success;
                                ratingText = "Excellent";
                            } else if (task.score === 4) {
                                ratingColor = '#34d399';
                                ratingText = "Very Good";
                            } else if (task.score === 3) {
                                ratingColor = colors.warning;
                                ratingText = "Satisfactory";
                            } else if (task.score === 2) {
                                ratingColor = '#fb923c';
                                ratingText = "Needs Work";
                            } else {
                                ratingColor = colors.danger;
                                ratingText = "Struggling";
                            }
    
                            doc.fillColor(ratingColor)
                                .fontSize(11)
                                .font('Helvetica-Bold')
                                .text(ratingText, 70 + col1Width + col2Width, yPosition);
    
                            if (task.description) {
                                doc.fillColor(colors.lightText)
                                    .fontSize(10)
                                    .font('Helvetica-Oblique')
                                    .text(`Remarks: ${task.description}`, 70, yPosition + 20, {
                                        width: doc.page.width - 140,
                                        align: 'left'
                                    });
                            }
    
                            yPosition += rowHeight + 10;
                        });
    
                        yPosition += 20;
                    }
                });
            }
    
            if (yPosition > doc.page.height - 150) {
                doc.addPage();
                yPosition = 50;
            }
    
            if (teacherComments) {
                doc.rect(50, yPosition, doc.page.width - 100, 150).fill('white').stroke(colors.secondary);
    
                doc.fillColor(colors.primary)
                    .fontSize(14)
                    .font('Helvetica-Bold')
                    .text('TEACHER COMMENTS', 70, yPosition + 15);
    
                doc.fillColor(colors.text)
                    .fontSize(11)
                    .font('Helvetica')
                    .text(teacherComments, 70, yPosition + 40, {
                        width: doc.page.width - 140,
                        align: 'left'
                    });
    
                yPosition += 160;
            }
    
            doc.rect(50, yPosition, (doc.page.width - 100) / 2 - 10, 100).fill('white').stroke(colors.secondary);
            doc.rect(50 + (doc.page.width - 100) / 2 + 10, yPosition, (doc.page.width - 100) / 2 - 10, 100).fill('white').stroke(colors.secondary);
            doc.end();
    
            writeStream.on("finish", async () => {
                try {
                    const cloudinaryResponse = await cloudinary.uploader.upload(filePath, {
                        resource_type: "auto",
                        folder: "reports",
                        type: "upload"
                    });
    
                    fs.unlinkSync(filePath);
    
                    const newDocument = new StudentDocument({
                        studentId,
                        documentType: "67e013547a0003be684c01db",
                        filePath: cloudinaryResponse.secure_url,
                        fileName: `Weekly Report - Week ${weekNumber} - ${reportDate || new Date().toISOString().split('T')[0]}`,
                        metadata: {
                            weekNumber,
                            categories: categories.map(cat => cat.categoryName),
                            reportDate: new Date()
                        }
                    });
    
                    await newDocument.save();
    
                    res.json({
                        success: true,
                        message: "Report generated, uploaded, and saved successfully",
                        pdfUrl: cloudinaryResponse.secure_url,
                        documentId: newDocument._id
                    });
                } catch (uploadError) {
                    console.error("Error during upload:", uploadError);
                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                    }
                    res.status(500).json({
                        success: false,
                        message: "Error uploading document",
                        error: uploadError.message
                    });
                }
            });
    
            writeStream.on("error", (writeError) => {
                console.error("Error writing PDF:", writeError);
                res.status(500).json({
                    success: false,
                    message: "Error generating PDF",
                    error: writeError.message
                });
            });
    
        } catch (error) {
            console.error("Error processing report:", error);
            res.status(500).json({
                success: false,
                message: "Error processing report",
                error: error.message
            });
        }
    });
  
import { sendEmail } from "../utils/Emails.js";
import { jobApplicationConfirmation } from "../utils/emailTemplates.js";

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
    uploadReport
 };