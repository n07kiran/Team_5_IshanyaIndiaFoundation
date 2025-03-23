import mongoose from "mongoose";

const fileMappingSchema = new mongoose.Schema({
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

const FileMapping = mongoose.model("FileMapping", fileMappingSchema);

export { FileMapping };

