import mongoose, { Schema } from "mongoose";

const studentDocumentSchema = new mongoose.Schema({
    studentId: {
        type: Schema.Types.ObjectId,
        ref: "Student", // References Student model
        required: true
    },
    documentType: {
        type: Schema.Types.ObjectId,
        ref: "Document", // References Document model
        required: true
    },
    filePath: {
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

export const StudentDocument = mongoose.model("StudentDocument", studentDocumentSchema);

