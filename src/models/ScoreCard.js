import mongoose from 'mongoose';
const { Schema } = mongoose;

const scoreCardSchema = new Schema(
  {
    student_id: {
      type: Schema.Types.ObjectId,
      ref: 'Student'
    },
    enrollment_id: {
      type: Schema.Types.ObjectId,
      ref: 'Enrollment',
      required: true
    },
    skill_area_id: {
      type: Schema.Types.ObjectId,
      ref: 'SkillArea'
    //   required: true
    },
    sub_task_id: {
      type: Schema.Types.ObjectId,
      ref: 'SubTask'
    //   required: true
    },
    year: {
      type: Number,
      required: true,
      default: new Date().getFullYear()
    },
    month: {
      type: String,
      enum: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      required: true
    },
    week: {
      type: Number,
    //   enum: [1, 2, 3, 4, 5],
    //   required: true
    },
    score: {
      type: Number,
      min: 0,
      max: 5,
      // required: true
    },
    description: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

const ScoreCard = mongoose.model('ScoreCard', scoreCardSchema);
export { ScoreCard }; 