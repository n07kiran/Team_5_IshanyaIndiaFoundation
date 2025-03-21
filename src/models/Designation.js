import mongoose, { Schema } from "mongoose";

const designationSchema = new Schema(
    {
        designationID: {
            type: String,
            required: true,
            unique: true,
            index: true
        },
        title: {
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

export const Designation = mongoose.model("Designation", designationSchema);
