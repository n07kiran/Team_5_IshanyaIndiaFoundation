import { Program } from '../models/Program.js';
import { SkillArea } from '../models/SkillArea.js';
import { SubTask } from '../models/SubTask.js';
import { ScoreCard } from '../models/ScoreCard.js';
import { Student } from '../models/Student.js';
import { Enrollment } from '../models/Enrollments.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import mongoose from 'mongoose';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';


const getFullEnrollment = async (req, res) => {
    try {
        console.log("Full Enrollment");
        const { enrollmentId } = req.params;

        // Fetch the enrollment details
        let fullEnrollment = await Enrollment.findById(enrollmentId)
                                    .select("programs")
                                    .populate({
                                        path: "programs",
                                        select: "_id name"
                                    });
        console.log(fullEnrollment);

        if (!fullEnrollment) {
            return res.status(404).json({ message: "Enrollment not found" });
        }

        // Fetch the skill areas and sub tasks
        const skillAreas = await SkillArea.find({ program_id: { $in: fullEnrollment.programs } })
        .select("_id name description program_id");
        // console.log(skillAreas);

        // Fetch the sub tasks
        const subTasks = await SubTask.find({ skill_area_id: { $in: skillAreas } })
        .select("_id name description skill_area_id");
        // console.log(subTasks);

        fullEnrollment = {
            ...fullEnrollment.toObject(),
            skillAreas: skillAreas,
            subTasks: subTasks
        };

        console.log(fullEnrollment);
        return res
        .status(200)
        .json(new ApiResponse(200, fullEnrollment, "Enrollment fetched successfully"));

    } catch (error) {
        throw new ApiError(error.message, error.statusCode);
    }

};

const getScoreCards = async (req, res) => {
    try {
        // Extract enrollment_id from query parameters
        const { enrollment_id } = req.params;

        // Validate if enrollment_id is provided
        if (!enrollment_id) {
            return res.status(400).json({ message: "Enrollment ID is required" });
        }

        // Fetch the enrollment data
        const enrollment = await Enrollment.findById(enrollment_id);

        if (!enrollment) {
            return res.status(404).json({ message: "Enrollment not found" });
        }

        // Fetch the student using the student field from enrollment
        const student = await Student.findById(enrollment.student)
            .select('name dob age gender contact_info');

        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        // Fetch all scorecards for this enrollment with more detailed population
        const scoreCards = await ScoreCard.find({ enrollment_id })
            .populate({
                path: 'skill_area_id',
                select: 'name description program_id',
                populate: {
                    path: 'program_id',
                    select: 'name description'
                }
            })
            .populate({
                path: 'sub_task_id',
                select: 'name description skill_area_id'
            })
            .select('_id skill_area_id sub_task_id year month week score description')
            .sort({ year: -1, month: -1, week: -1 }); // Sort by date descending

        // Create a map to hold ordered month values for proper comparison
        const monthOrder = {
            "January": 0, "February": 1, "March": 2, "April": 3, "May": 4, "June": 5,
            "July": 6, "August": 7, "September": 8, "October": 9, "November": 10, "December": 11
        };

        // Sort the scoreCards manually by program, skill area, subtask, and then date descending
        const sortedScoreCards = [...scoreCards].sort((a, b) => {
            // First sort by program name
            const programNameA = a.skill_area_id?.program_id?.name || "";
            const programNameB = b.skill_area_id?.program_id?.name || "";
            
            if (programNameA !== programNameB) {
                return programNameA.localeCompare(programNameB);
            }
            
            // Then sort by skill area name
            const skillAreaNameA = a.skill_area_id?.name || "";
            const skillAreaNameB = b.skill_area_id?.name || "";
            
            if (skillAreaNameA !== skillAreaNameB) {
                return skillAreaNameA.localeCompare(skillAreaNameB);
            }
            
            // Then sort by sub task name
            const subTaskNameA = a.sub_task_id?.name || "";
            const subTaskNameB = b.sub_task_id?.name || "";
            
            if (subTaskNameA !== subTaskNameB) {
                return subTaskNameA.localeCompare(subTaskNameB);
            }
            
            // Then sort by year (descending)
            if (a.year !== b.year) {
                return b.year - a.year;
            }
            
            // Then sort by month (descending)
            const monthValueA = monthOrder[a.month];
            const monthValueB = monthOrder[b.month];
            
            if (monthValueA !== monthValueB) {
                return monthValueB - monthValueA;
            }
            
            // Finally sort by week (descending)
            return b.week - a.week;
        });

        // Prepare response data
        const responseData = {
            student: student,
            scoreCards: sortedScoreCards
        };

        // console.log(responseData);

        // Return the scorecards data
        return res.status(200).json(
            new ApiResponse(200, responseData, "ScoreCards fetched successfully")
        );
        
    } catch (error) {
        console.error("Error fetching scorecards:", error);
        throw new ApiError(error.message || "Failed to fetch scorecards", error.statusCode || 500);
    }
};

const addReport = async (req, res) => {
    try {
        // Extracting ScoreCard details from req.body
        const {
            enrollment_id,
            skill_area_id,
            sub_task_id,
            year = new Date().getFullYear(), // Default to current year if not provided
            month,
            week,
            score,
            description
        } = req.body;

        // from enrollment_id, get student_id
        const enrollment = await Enrollment.findById(enrollment_id);
        const student_id = enrollment.student_id;

        // verify the input data from db and display corect detailed error message for each field
        if(!enrollment_id || !enrollment){
            return res.status(400).json({ message: "Enrollment ID is required" });
        }

        const skill_area = await SkillArea.findById(skill_area_id);
        const sub_task = await SubTask.findById(sub_task_id);

       // any one of skill_area_id or sub_task_id is required
       if(!skill_area_id && !sub_task_id){
        return res.status(400).json({ message: "Skill Area ID or Sub Task ID is required" });
       }

       if(!skill_area || !sub_task){
        return res.status(400).json({ message: "Skill Area or Sub Task is required" });
       }

       // month is required and check month is valid from enum values
       if(!month || !["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].includes(month)){
        return res.status(400).json({ message: "Invalid month" });
       }

       // week is required and check week is valid from 1 to 4
       if(!week || week < 1 || week > 5){
        return res.status(400).json({ message: "Invalid week" });
       }

        const scoreCard = new ScoreCard({
            student_id,
            enrollment_id,
            skill_area_id,
            sub_task_id,
            year,
            month,
            week,
            score,
            description
        });

        try{
            await scoreCard.save();
            res.status(201).json({ message: "ScoreCard created successfully" });
        }catch(error){
            throw new ApiError(error.message, error.statusCode);
        }

    } catch (error) {
        throw new ApiError(error.message, error.statusCode);
    }
}

const generateReport = async (req, res) => {
    try {
        // Extract query parameters from req.body
        const { 
            enrollment_id, 
            startMonth, 
            endMonth, 
            startYear = new Date().getFullYear(), 
            endYear = new Date().getFullYear() 
        } = req.body;

        // Validate required parameters
        if (!enrollment_id) {
            return res.status(400).json({ message: "Enrollment ID is required" });
        }

        if (!startMonth || !endMonth) {
            return res.status(400).json({ message: "Start month and end month are required" });
        }

        // Validate month values
        const validMonths = ["January", "February", "March", "April", "May", "June", 
                            "July", "August", "September", "October", "November", "December"];
        
        if (!validMonths.includes(startMonth) || !validMonths.includes(endMonth)) {
            return res.status(400).json({ message: "Invalid month values" });
        }

        // Fetch enrollment details with populated student, program, and employee data
        const enrollment = await Enrollment.findById(enrollment_id)
            .populate({
                path: 'student_id',
                select: 'name dob age gender contact_info'
            })
            .populate({
                path: 'programs',
                select: 'name description'
            })
            .populate({
                path: 'employee_id',
                select: 'name designation'
            });

        if (!enrollment) {
            return res.status(404).json({ message: "Enrollment not found" });
        }

        // Get program IDs from enrollment
        const programIds = enrollment.programs.map(program => program._id);

        // Find skill areas that belong to these programs
        const skillAreas = await SkillArea.find({ program_id: { $in: programIds } })
            .select('_id name program_id');

        // Find sub tasks that belong to these skill areas
        const skillAreaIds = skillAreas.map(area => area._id);
        const subTasks = await SubTask.find({ skill_area_id: { $in: skillAreaIds } })
            .select('_id name skill_area_id');

        // Create a month index lookup for comparison
        const monthIndex = {};
        validMonths.forEach((month, index) => {
            monthIndex[month] = index;
        });

        // Find scorecards for this enrollment that match the date range
        // and belong to the relevant skill areas or sub tasks
        const scoreCards = await ScoreCard.find({
            enrollment_id: enrollment_id,
            $or: [
                { skill_area_id: { $in: skillAreaIds } },
                { sub_task_id: { $in: subTasks.map(task => task._id) } }
            ],
            $and: [
                // Handle same year case
                {
                    $or: [
                        // Start and end in same year
                        {
                            year: startYear,
                            month: { 
                                $gte: startMonth, 
                                $lte: startYear === endYear ? endMonth : "December" 
                            }
                        },
                        // Different years
                        {
                            year: endYear,
                            month: { 
                                $gte: startYear === endYear ? startMonth : "January", 
                                $lte: endMonth 
                            }
                        },
                        // Years in between
                        {
                            year: { $gt: startYear, $lt: endYear }
                        }
                    ]
                }
            ]
        }).populate('skill_area_id sub_task_id');

        // Format and prepare the report data
        const reportData = {
            student: enrollment.student_id,
            employee: enrollment.employee_id,
            programs: enrollment.programs,
            dateRange: {
                start: { month: startMonth, year: startYear },
                end: { month: endMonth, year: endYear }
            },
            skillAreas: skillAreas,
            subTasks: subTasks,
            scoreCards: scoreCards
        };

        console.log(reportData);

        // Return the report data
        return res.status(200).json(
            new ApiResponse(200, reportData, "Report generated successfully")
        );

    } catch (error) {
        console.error("Error generating report:", error);
        throw new ApiError(error.message || "Failed to generate report", error.statusCode || 500);
    }
};

export { getFullEnrollment, addReport, generateReport, getScoreCards };
