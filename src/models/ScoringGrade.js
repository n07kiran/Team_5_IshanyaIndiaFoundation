import mongoose from 'mongoose';
const { Schema } = mongoose;

const scoringGradeSchema = new Schema(
  {
    score: {
      type: Number,
      min: 0,
      required: true,
      unique: true
    },
    description: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);

const ScoringGrade = mongoose.model('ScoringGrade', scoringGradeSchema);
export { ScoringGrade }; 