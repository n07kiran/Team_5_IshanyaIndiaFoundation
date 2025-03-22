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

// Static method to generate next diagnosis ID
diagnosisSchema.statics.generateDiagnosisID = async function() {
    // Find the diagnosis with the highest diagnosisID
    const lastDiagnosis = await this.findOne({}, { diagnosisID: 1 })
        .sort({ diagnosisID: -1 })  
        .lean();

    // If no diagnosis exists, return the first ID in the sequence
    if (!lastDiagnosis) {
        return "DGN001";
    }   

    // Extract the numeric part from the last ID
    const lastID = lastDiagnosis.diagnosisID;
    const numericPart = parseInt(lastID.replace("DGN", ""));

    // Increment the numeric part
    const nextNumericPart = numericPart + 1;    

    // Pad the numeric part with zeros to ensure 3-digit format
    const paddedNumericPart = String(nextNumericPart).padStart(3, "0");

    // Return the new diagnosis ID
    return `DGN${paddedNumericPart}`;
};  

// Pre-save hook to auto-generate diagnosis ID if not provided
diagnosisSchema.pre("save", async function(next) {
    // Only generate ID for new diagnoses that don't have an ID yet
    if (this.isNew && !this.diagnosisID) {  
        this.diagnosisID = await this.constructor.generateDiagnosisID();
    }
    next();
});


export const Diagnosis = mongoose.model("Diagnosis", diagnosisSchema);