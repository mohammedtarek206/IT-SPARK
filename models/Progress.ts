import mongoose, { Document, Schema } from 'mongoose';

export interface IProgress extends Document {
    user: mongoose.Types.ObjectId;
    course: mongoose.Types.ObjectId;
    completedLessons: mongoose.Types.ObjectId[];
    lastAccessed: Date;
    progressPercentage: number;
}

const ProgressSchema: Schema = new Schema(
    {
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
        completedLessons: [{ type: Schema.Types.ObjectId, ref: 'Lesson' }],
        lastAccessed: { type: Date, default: Date.now },
        progressPercentage: { type: Number, default: 0 },
    },
    {
        timestamps: true,
    }
);

// Compound index for efficient lookup
ProgressSchema.index({ user: 1, course: 1 }, { unique: true });

export default mongoose.models.Progress || mongoose.model<IProgress>('Progress', ProgressSchema);
