import { Schema } from "mongoose";
import mongoose from "mongoose";

const enrollmentSchema = new mongoose.Schema({
    student: {
        type: Schema.Types.ObjectId,
        ref: "Student"
    },
    programs: [
        {
            type: Schema.Types.ObjectId,
            ref: "Program"
        }
    ],
    educator: {
        type: Schema.Types.ObjectId,
        ref: "Employee"
    },
    secondaryEducator: {
        type: Schema.Types.ObjectId,
        ref: "Employee"
    },
    level: {
        type: Number,
        required: true,
        default: 1
    },
    status: {
        type: String,
        enum: ["Active", "Inactive","Completed"],
        default: "Active"
    },
    sessions: [
            {
                type: Schema.Types.ObjectId,
                ref: "Session"
            }
    ]
},
    {
        timestamps: true
    }
);

enrollmentSchema.index({ student: 1 });
enrollmentSchema.index({ educator: 1 });
enrollmentSchema.index({ secondaryEducator: 1 });
enrollmentSchema.index({ updatedAt: -1 });

const Enrollment = mongoose.model("Enrollment", enrollmentSchema);

export { Enrollment };
