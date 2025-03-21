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
            required: true
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
        contact: {
            type: String,
            required: true
        },
        address: {
            type: String
        },
        employmentType: {
            type: String
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
        tenure: {
            type: String
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
        }
    },
    {
        timestamps: true
    }
);

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
            designation: this.designation.title
        },
        process.env.ACCESS_TOKEN_SECRET_KEY,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    );
};

export const Employee = mongoose.model("Employee", employeeSchema);