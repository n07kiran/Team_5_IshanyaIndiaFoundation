import mongoose, { Schema } from "mongoose";
const timeSchema = new Schema(
    {
      hr: {
        type: Number,
        required: true,
        min: [0, "Hour must be at least 0"],
        max: [23, "Hour cannot exceed 23"]
      },
      min: {
        type: Number,
        required: true,
        min: [0, "Minute must be at least 0"],
        max: [59, "Minute cannot exceed 59"]
      }
    },
    { _id: false } // Prevents creation of an _id for this subdocument
  );

  export {timeSchema};

