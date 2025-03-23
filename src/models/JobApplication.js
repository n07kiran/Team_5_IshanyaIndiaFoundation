import mongoose from "mongoose";

const jobApplicationSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  phoneNumber: {
    type: String,
    required: true,
    trim: true
  },
  gender: {
    type: String,
    enum: ["Male", "Female", "Other"],
    required: true
  },
  yearsOfExperience: {
    type: String,
    required: true,
    min: 0
  },
  resumeLink: {
    type: String,
    required: true
  },
  portfolioLink: {
    type: String
  },
  highestQualification: {
    type: String,
    enum: [
      "Bachelor's Degree",
      "Master's Degree",
      "Ph.D",
      "Teaching Certificate",
      "Other"
    ],
    required: true
  },
  howDidYouHearAboutUs: {
    type: String,
    enum: [
      "Job Board",
      "Social Media",
      "Referral from Friend/Colleague",
      "Our Website",
      "Other"
    ],
    required: true
  },
  employmentType: {
    type: String,
    enum: ["Full-time", "Part-time", "Internship", "Contract"],
    required: true
  },
  whyJoinUs: {
    type: String,
    required: true
  },
  progress:{
    type:String,
    enum:["Applied","Under_Review","Rejected","Hired"]
  }
}, { timestamps: true });

const JobApplication = mongoose.model("JobApplication", jobApplicationSchema);

export default JobApplication;
