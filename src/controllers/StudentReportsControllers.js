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
export { getFullEnrollment, addReport};
