import mongoose, { Schema } from "mongoose";

const momentOfDaySchema = new mongoose.Schema(
  {
    studentId: { 
      type: [Schema.Types.ObjectId],
      ref: "Student",
      default: []
    },
    employeeId: { 
      type: [Schema.Types.ObjectId],
      ref: "Employee",
      default: [] 
    },
    date: { 
      type: Date, 
      default: Date.now
    },
    publicUrl: { 
      type: String,
      required: true,
      trim: true 
    },
    caption: { 
      type: String, 
      trim: true 
    },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "published"
    }
  },
  { timestamps: true }
);

const MomentOfDay = mongoose.model("MomentOfDay", momentOfDaySchema);
export { MomentOfDay }; 