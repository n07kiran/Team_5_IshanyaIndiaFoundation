import mongoose from "mongoose";


const enrollmentSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student"
    },
    programs: [
        {
            _id: {
                type: Schema.Types.ObjectId,
                ref: "Program"
            }
        }
    ],
    educator: {
        _id: {
            type: Schema.Types.ObjectId,
            ref: "Employee"
        }
    },
    secondaryEducator: {
        _id: {
            type: Schema.Types.ObjectId,
            ref: "Employee"
        }
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
            _id: {
                type: Schema.Types.ObjectId,
                ref: "Session"
            }
        }
    ]
},
    {
        timestamps: true
    }
);

const Enrollment = mongoose.model("Enrollment", enrollmentSchema);

export default Enrollment;
