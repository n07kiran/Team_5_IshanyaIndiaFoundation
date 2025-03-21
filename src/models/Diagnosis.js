import mongoose, { Schema } from "mongoose";

const diagnosisSchema = new Schema(
    {
        diagnosisID: {
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
        category: {
            type: String,
            required: true
        },
        description: {
            type: String
        }
    },
    {
        timestamps: true
    }
);

export const Diagnosis = mongoose.model("Diagnosis", diagnosisSchema);