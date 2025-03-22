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

// Static method to generate next department ID
departmentSchema.statics.generateDepartmentID = async function() {
    // Find the department with the highest departmentID
    const lastDepartment = await this.findOne({}, { departmentID: 1 })
        .sort({ departmentID: -1 }) 
        .lean();

    // If no department exists, return the first ID in the sequence
    if (!lastDepartment) {
        return "DPT001";
    }

    // Extract the numeric part from the last ID
    const lastID = lastDepartment.departmentID;
    const numericPart = parseInt(lastID.replace("DPT", ""));

    // Increment the numeric part
    const nextNumericPart = numericPart + 1;

    // Pad the numeric part with zeros to ensure 3-digit format
    const paddedNumericPart = String(nextNumericPart).padStart(3, "0");

    // Return the new department ID
    return `DPT${paddedNumericPart}`;
};

// Pre-save hook to auto-generate department ID if not provided
departmentSchema.pre("save", async function(next) { 
    // Only generate ID for new departments that don't have an ID yet
    if (this.isNew && !this.departmentID) {
        this.departmentID = await this.constructor.generateDepartmentID();
    }
    next();
});




export const Department = mongoose.model("Department", departmentSchema);