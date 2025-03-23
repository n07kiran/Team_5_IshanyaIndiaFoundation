import mongoose from "mongoose";

const PhotoFileMappingSchema = new mongoose.Schema({
    publicUrl: {
        type: String,
    },
    localFilePath: {
        type: String,
    },
    publicId: {
        type: String,
    }
    },
    {
        timestamps: true
    }
);

const PhotoFileMapping = mongoose.model("PhotoFileMapping", PhotoFileMappingSchema);

export { PhotoFileMapping };

