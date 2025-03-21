import mongoose, { Schema } from "mongoose";

const departmentSchema = new Schema(
    {
        departmentID: {
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
        }
    },
    {
        timestamps: true
    }
);

export const Department = mongoose.model("Department", departmentSchema);