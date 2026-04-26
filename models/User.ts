import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  phone?: string;
  password?: string;
  role: 'admin' | 'student' | 'instructor';
  status: 'active' | 'pending' | 'banned';
  accessCode?: string; // For code-only login
  targetGoal?: 'job' | 'freelance' | 'skill';
  interestedTrack?: string;
  points: number;
  level: number;
  badges: { badgeId: string; earnedAt: Date }[];
  enrolledTracks: mongoose.Types.ObjectId[];
  enrolledCourses: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    phone: { type: String },
    password: { type: String },
    role: {
      type: String,
      enum: ['admin', 'student', 'instructor'],
      default: 'student',
    },
    status: {
      type: String,
      enum: ['active', 'pending', 'banned'],
      default: 'active',
    },
    accessCode: { type: String, unique: true, sparse: true },
    targetGoal: {
      type: String,
      enum: ['job', 'freelance', 'skill'],
    },
    interestedTrack: { type: String },
    points: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    badges: [
      {
        badgeId: { type: String, required: true },
        earnedAt: { type: Date, default: Date.now },
      },
    ],
    enrolledTracks: [{ type: Schema.Types.ObjectId, ref: 'Track' }],
    enrolledCourses: [{ type: Schema.Types.ObjectId, ref: 'Course' }],
  },
  {
    timestamps: true,
  }
);

UserSchema.index({ role: 1 });
UserSchema.index({ status: 1 });
UserSchema.index({ createdAt: -1 });

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
