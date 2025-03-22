import mongoose, { Schema } from "mongoose";
import { generateHashedPasswordSync } from "../utils/Password.js";
import { DEFAULT_PASSWORD } from "../constants.js";

const studentSchema = new Schema(
    {
        studentID: {
            type: String,
            required: true,
            unique: true,
            index: true,
            // Generated automatically using a pre-save hook, e.g., 2025001, 2025099
          },
        uuid: {
            type: String,
            unique: true
        },
        photo: {
            type: String // Cloudinary URL or file path
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
            enum: ["Male", "Female","Other"]
        },
        dob: {
            type: Date,
            required: true
        },
        bloodGroup: {
            type: String,
            enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
        },
        allergies: {
            type: String
        },
        phoneNumber: {
            type: String,
            required: true
        },
        secondaryPhoneNumber: {
            type: String
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        parentEmail: {
            type: String,
            lowercase: true,
            trim: true
        },
        fatherName: {
            type: String
        },
        motherName: {
            type: String
        },
        address: {
            type: String
        },
        transport: {
            type: Boolean,
            default: false
            // Changed to Boolean to reflect yes/no value
        },
        strengths: {
            type: String
        },
        weaknesses: {
            type: String
        },
        comments: {
            type: String
        },
        primaryDiagnosis: {
            type: Schema.Types.ObjectId,
            ref: "Diagnosis"
        },
        comorbidity: [{
            type: Schema.Types.ObjectId,
            ref: "Diagnosis"
        }],
        enrollmentDate: {
            type: Date,
            default: Date.now
        },
        status: {
            type: String,
            enum: ["Active", "Inactive"],
            default: "Active"
        },
        password: {
            type: String,
            default: generateHashedPasswordSync(DEFAULT_PASSWORD)
        }
    },
    {
      timestamps: true
    }
  );

// Static method to generate next student ID
studentSchema.statics.generateStudentID = async function() {
    // Find the student with the highest studentID
    const lastStudent = await this.findOne({}, { studentID: 1 })
        .sort({ studentID: -1 })
        .lean();

    // If no student exists, return the first ID in the sequence
    if (!lastStudent) {
        return "2025001";
    }

    // Extract the numeric part from the last ID
    const lastID = lastStudent.studentID;
    const numericPart = parseInt(lastID.replace("2025", ""));

    // Increment the numeric part
    const nextNumericPart = numericPart + 1;    

    // Pad the numeric part with zeros to ensure 3-digit format
    const paddedNumericPart = String(nextNumericPart).padStart(3, "0");

    // Return the new student ID
    return `2025${paddedNumericPart}`;
};


studentSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

studentSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};

studentSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            firstName: this.firstName,
            studentID: this.studentID,
            role: "student"
        },
        process.env.ACCESS_TOKEN_SECRET_KEY,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    );
};


export const Student = mongoose.model("Student", studentSchema);
