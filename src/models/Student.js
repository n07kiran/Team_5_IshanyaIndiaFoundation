import mongoose, { Schema } from "mongoose";

const studentSchema = new Schema(
    {
        studentID: {
            type: String,
            required: true,
            unique: true,
            index: true
        },
        photo: {
            type: String // Cloudinary URL or file path
        },
        firstName: {
            type: String,
            required: true,
            trim: true
        },
        lastName: {
            type: String,
            required: true,
            trim: true
        },
        gender: {
            type: String,
            required: true
        },
        dob: {
            type: Date,
            required: true
        },
        bloodGroup: {
            type: String
        },
        allergies: {
            type: String
        },
        phoneNumber: {
            type: String,
            required: true
        },
        secondaryPhoneNumber: {
            type: String
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        parentEmail: {
            type: String,
            lowercase: true,
            trim: true
        },
        fatherName: {
            type: String
        },
        motherName: {
            type: String
        },
        address: {
            type: String
        },
        transport: {
            type: String
        },
        strengths: {
            type: String
        },
        weaknesses: {
            type: String
        },
        comments: {
            type: String
        },
        primaryDiagnosis: {
            type: Schema.Types.ObjectId,
            ref: "Diagnosis"
        },
        comorbidity: {
            type: Schema.Types.ObjectId,
            ref: "Diagnosis"
        },
        programs: [
            {
                type: Schema.Types.ObjectId,
                ref: "Program"
            }
        ],
        educator: {
            type: Schema.Types.ObjectId,
            ref: "Educator"
        },
        secondaryEducator: {
            type: Schema.Types.ObjectId,
            ref: "Educator"
        },
        sessionType: {
            type: String
        },
        noOfSessions: {
            type: Number,
            default: 0
        },
        timings: {
            type: String
        },
        status: {
            type: String,
            enum: ["Active", "Inactive"],
            default: "Active"
        }
    },
    {
        timestamps: true
    }
);



export const Student = mongoose.model("Student", studentSchema);
