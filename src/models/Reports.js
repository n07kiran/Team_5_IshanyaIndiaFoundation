import mongoose, { Schema } from "mongoose";

const reportSchema = new Schema(
    {
        reportID: {
            type: String,
            required: true,
            unique: true,
            index: true
        },
        assessmentType: {
            type: String,
            required: true
        },
        reportFile: {
            type: String,
            required: true
        },
        remarks: {
            type: String
        },
        dateCreated: {
            type: Date,
            default: Date.now
        },
        studentID: {
            type: Schema.Types.ObjectId,
            ref: "Student",
            required: true
        },
        educatorID: {
            type: Schema.Types.ObjectId,
            ref: "Educator",
            required: true
        }
    },
    {
        timestamps: true
    }
);

export const Report = mongoose.model("Report", reportSchema);