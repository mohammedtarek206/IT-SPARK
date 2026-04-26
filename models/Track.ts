import mongoose, { Document, Schema } from 'mongoose';

export interface ILesson {
  title: string;
  description: string;
  videoUrl: string; // YouTube URL or ID
  duration?: string;
}

export interface ITrack extends Document {
  title: string;
  description: string;
  icon: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  language: string[];
  curriculum: string[];
  lessons: ILesson[];
  price: number;
  slug: string;
  imageUrl: string;
  isActive: boolean;
  courses: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const TrackSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String, required: true },
    level: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      required: true,
    },
    duration: { type: String, required: true },
    language: [{ type: String }],
    curriculum: [{ type: String }],
    lessons: [
      {
        title: { type: String, required: true },
        description: { type: String },
        videoUrl: { type: String, required: true },
        duration: { type: String, default: '0:00' },
      },
    ],
    price: { type: Number, default: 0 },
    slug: { type: String, required: true, unique: true },
    imageUrl: { type: String },
    courses: [{ type: Schema.Types.ObjectId, ref: 'Course' }],
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

TrackSchema.index({ isActive: 1 });
TrackSchema.index({ createdAt: -1 });

export default mongoose.models.Track || mongoose.model<ITrack>('Track', TrackSchema);
