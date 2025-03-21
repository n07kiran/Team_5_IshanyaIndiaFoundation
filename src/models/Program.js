import mongoose, { Schema } from "mongoose";

const programSchema = new Schema(
    {
        programID: {
            type: String,
            required: true,
            unique: true,
            index: true
        },
        name: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String
        },
        duration: {
            type: String
        },
        eligibilityCriteria: {
            type: String
        }
    },
    {
        timestamps: true
    }
);

export const Program = mongoose.model("Program", programSchema);