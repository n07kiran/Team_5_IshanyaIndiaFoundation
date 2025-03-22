import mongoose from "mongoose";
import { timeSchema } from "./Time.js";

const sessionSchema = new mongoose.Schema({
    sessionType: {
        type: String,
        enum: ["online", "offline"]
    },
    daysOfWeek: {
        type: [String],
        enum: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
        // Stores the days the student attends, e.g., ["monday", "wednesday", "friday"]
    },
    noOfSessions: {
        type: Number,
        default: 0
    },
    startTime: {
        type: timeSchema,
        required: true
    },
    endTime: {
        type: timeSchema,
        required: true
    }
},{
    timestamps: true
});

const Session = mongoose.model("Session", sessionSchema);

export default Session;

