import mongoose, { Document, Schema } from 'mongoose';

export interface IProject extends Document {
  title: string;
  description: string;
  student: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
  repoUrl?: string;
  demoUrl?: string;
  filesUrl?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'revision';
  grade?: number;
  feedback?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    repoUrl: { type: String },
    demoUrl: { type: String },
    filesUrl: { type: String },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'revision'],
      default: 'pending',
    },
    grade: { type: Number },
    feedback: { type: String },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);
