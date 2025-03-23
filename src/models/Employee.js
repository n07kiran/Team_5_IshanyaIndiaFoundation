import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { generateHashedPasswordSync } from "../utils/Password.js";
import { DEFAULT_PASSWORD } from "../constants.js";

const employeeSchema = new Schema(
    {
        employeeID: {
            type: String,
            required: true,
            unique: true,
            index: true
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
            required: true,
            enum: ["Male", "Female", "Other"]
        },
        photo: {
            type: String
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        phoneNumber: {
            type: String,
            required: true
        },
        address: {
            type: String
        },
        employmentType: {
            type: String,
            enum: ["Full-Time", "Part-Time", "Intern"] // TODO: Get it from the excel file
        },
        status: {
            type: String,
            enum: ["Active", "Inactive"],
            default: "Active"
        },
        dateOfJoining: {
            type: Date
        },
        dateOfLeaving: {
            type: Date
        },
        workLocation: {
            type: String
        },
        comments: {
            type: String
        },
        designation: {
            type: Schema.Types.ObjectId,
            ref: "Designation"
        },
        department: {
            type: Schema.Types.ObjectId,
            ref: "Department"
        },
        programs: [
            {
                type: Schema.Types.ObjectId,
                ref: "Program"
            }
        ],
        password:{
            type:String,
            default: generateHashedPasswordSync(DEFAULT_PASSWORD)
        },
        role: {
            type: String,
            enum: ["admin", "employee"],
            default: "employee"
        }
    },
    {
        timestamps: true
    }
);

// Static method to generate next employee ID
employeeSchema.statics.generateEmployeeID = async function() {
    // Find the employee with the highest employeeID
    const lastEmployee = await this.findOne({}, { employeeID: 1 })
        .sort({ employeeID: -1 })
        .lean();
    
    // If no employee exists, return the first ID in the sequence
    if (!lastEmployee) {
        return "IIF001";
    }
    
    // Extract the numeric part from the last ID
    const lastID = lastEmployee.employeeID;
    const numericPart = parseInt(lastID.replace("IIF", ""));
    
    // Increment the numeric part
    const nextNumericPart = numericPart + 1;
    
    // Pad the numeric part with zeros to ensure 3-digit format
    const paddedNumericPart = String(nextNumericPart).padStart(3, "0");
    
    // Return the new employee ID
    return `IIF${paddedNumericPart}`;
};

// Pre-save hook to auto-generate employee ID if not provided
employeeSchema.pre("save", async function(next) {
    // Only generate ID for new employees that don't have an ID yet
    if (this.isNew && !this.employeeID) {
        this.employeeID = await this.constructor.generateEmployeeID();
    }
    next();
});

employeeSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

employeeSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};

employeeSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            firstName: this.firstName,
            employeeID: this.employeeID,
            role : this.role
        },
        process.env.ACCESS_TOKEN_SECRET_KEY,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    );
};

export const Employee = mongoose.model("Employee", employeeSchema);