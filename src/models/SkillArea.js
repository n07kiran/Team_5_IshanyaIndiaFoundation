import mongoose from 'mongoose';
const { Schema } = mongoose;

const skillAreaSchema = new Schema(
  {
    program_id: {
      type: Schema.Types.ObjectId,
      ref: 'Program',
    //   required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
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

const SkillArea = mongoose.model('SkillArea', skillAreaSchema);
export { SkillArea }; 