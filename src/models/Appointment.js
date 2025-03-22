import mongoose,{Schema} from "mongoose";
import { timeSchema } from "./timeSchema.js"; // Import timeSchema

const appointmentSchema = new mongoose.Schema(
  {
    studentName: { type: String, required: true, trim: true },
    parentName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    time: { type: timeSchema, required: true }, // Use timeSchema here
    message: { type: String, trim: true },
    status: {
        type: String,
        enum: ["pending", "scheduled", "completed"],
        default: "pending"
      },
    remarks: {
      type: String,
      trim: true
    },
    employee: {
      type: Schema.Types.ObjectId,
      ref: "Employee"
    },
    verdict: {
      type: String,
      enum: ["joined", "recommendation"]
    }
  },
  { timestamps: true }
);

const Appointment = mongoose.model("Appointment", appointmentSchema);

export default Appointment;
