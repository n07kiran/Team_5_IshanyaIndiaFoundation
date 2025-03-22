import mongoose from "mongoose";


const enrollmentSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
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
        ref: "Educator"
    },
    secondaryEducator: {
        type: Schema.Types.ObjectId,
        ref: "Educator"
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

const Enrollment = mongoose.model("Enrollment", enrollmentSchema);

export default Enrollment;
