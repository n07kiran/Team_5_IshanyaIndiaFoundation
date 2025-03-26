import mongoose from "mongoose";
import { Schema } from "mongoose";

const employeeDocumentSchema = new mongoose.Schema({
    employeeId: {
        type: Schema.Types.ObjectId,
        ref: "Employee", // References Employee model
        required: true
    },
    documentType: {
        type: Schema.Types.ObjectId,
        ref: "Document", // References Document model
        required: true
    },
    publicUrl: {
        type: String,
        required: true,
        trim: true
    },
    fileName: {
        type: String,
        required: true,
        trim: true
    }
}, { timestamps: true });

const EmployeeDocument = mongoose.model("EmployeeDocument", employeeDocumentSchema);

export {EmployeeDocument};
