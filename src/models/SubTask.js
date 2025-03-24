import mongoose from 'mongoose';
const { Schema } = mongoose;

const subTaskSchema = new Schema(
  {
    skill_area_id: {
      type: Schema.Types.ObjectId,
      ref: 'SkillArea',
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

const SubTask = mongoose.model('SubTask', subTaskSchema);
export { SubTask }; 