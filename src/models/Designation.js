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

// Static method to generate next designation ID
designationSchema.statics.generateDesignationID = async function() {
    // Find the designation with the highest designationID
    const lastDesignation = await this.findOne({}, { designationID: 1 })
        .sort({ designationID: -1 })
        .lean();

    // If no designation exists, return the first ID in the sequence
    if (!lastDesignation) {
        return "DES001";
    }

    // Extract the numeric part from the last ID
    const lastID = lastDesignation.designationID;
    const numericPart = parseInt(lastID.replace("DES", ""));

    // Increment the numeric part
    const nextNumericPart = numericPart + 1;    

    // Pad the numeric part with zeros to ensure 3-digit format
    const paddedNumericPart = String(nextNumericPart).padStart(3, "0");

    // Return the new designation ID
    return `DES${paddedNumericPart}`;
};  

// Pre-save hook to auto-generate designation ID if not provided
designationSchema.pre("save", async function(next) {
    // Only generate ID for new designations that don't have an ID yet
    if (this.isNew && !this.designationID) {
        this.designationID = await this.constructor.generateDesignationID();
    }
    next();
});


export const Designation = mongoose.model("Designation", designationSchema);
