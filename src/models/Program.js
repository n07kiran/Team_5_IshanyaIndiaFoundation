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
        prospectusFile:{
            type: String, // TODO: Add file type
            default: null
        },
        eligibilityCriteria: {
            type: String
        }
    },
    {
        timestamps: true
    }
);

// Static method to generate next program ID
programSchema.statics.generateProgramID = async function() {
    // Find the program with the highest programID
    const lastProgram = await this.findOne({}, { programID: 1 })
        .sort({ programID: -1 })    
        .lean();

    // If no program exists, return the first ID in the sequence
    if (!lastProgram) {
        return "PRG001";
    }   

    // Extract the numeric part from the last ID
    const lastID = lastProgram.programID;
    const numericPart = parseInt(lastID.replace("PRG", ""));

    // Increment the numeric part
    const nextNumericPart = numericPart + 1;    

    // Pad the numeric part with zeros to ensure 3-digit format
    const paddedNumericPart = String(nextNumericPart).padStart(3, "0");

    // Return the new program ID
    return `PRG${paddedNumericPart}`;
};  

// Pre-save hook to auto-generate program ID if not provided
programSchema.pre("save", async function(next) {
    // Only generate ID for new programs that don't have an ID yet
    if (this.isNew && !this.programID) {    
        this.programID = await this.constructor.generateProgramID();
    }
    next();
});     


export const Program = mongoose.model("Program", programSchema);