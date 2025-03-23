import mongoose from "mongoose";

const jobApplicationSchema = new mongoose.Schema({
    jobId: {
        type: String,
        unique: true,
        index: true
    },
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
        type: String,  // Changed back to String
        required: true,
        trim: true
    },
    resumeLink: {
        type: String,
        required: true
    },
    portfolioLink: {
        type: String
    },
    address:{
        type:String
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
        enum: ["Full-Time", "Part-Time", "Intern"],
        required: true
    },
    whyJoinUs: {
        type: String,
        required: true
    },
    progress: {
        type: String,
        enum: ["Applied", "Under_Review", "Rejected", "Hired"],
        default: "Applied"
    }
}, { timestamps: true });

/**
 * Generates a unique job ID in the format JOB001, JOB002...
 */
jobApplicationSchema.statics.generateJobID = async function () {
    const lastJob = await this.findOne({}, { jobId: 1 }).sort({ jobId: -1 }).lean();

    if (!lastJob) {
        return "JOB001";
    }

    const lastID = lastJob.jobId;
    const numericPart = parseInt(lastID.replace("JOB", ""), 10);
    const nextNumericPart = numericPart + 1;

    return `JOB${String(nextNumericPart).padStart(3, "0")}`;
};

// Auto-generate jobId before saving a new job application
jobApplicationSchema.pre("save", async function (next) {
    if (this.isNew && !this.jobId) {
        this.jobId = await this.constructor.generateJobID();
    }
    next();
});

export const JobApplication = mongoose.model("JobApplication", jobApplicationSchema);
