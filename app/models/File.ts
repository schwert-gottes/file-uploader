import mongoose from 'mongoose';

const FileSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  size: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.File || mongoose.model('File', FileSchema); 