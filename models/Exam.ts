import mongoose, { Document, Schema } from 'mongoose';

export interface IQuestion {
    text: string;
    type: 'mcq' | 'tf' | 'essay';
    options?: string[]; // For mcq/tf
    correctAnswer?: string | number; // Index for mcq, "true"/"false" for tf, null for essay
    points: number;
}

export interface IExam extends Document {
    title: string;
    description: string;
    courseId?: mongoose.Types.ObjectId;
    trackId?: mongoose.Types.ObjectId;
    instructorId: mongoose.Types.ObjectId;
    duration: number; // in minutes
    passScore: number;
    questions: IQuestion[];
    createdAt: Date;
    updatedAt: Date;
}

const ExamSchema: Schema = new Schema(
    {
        title: { type: String, required: true },
        description: { type: String, required: true },
        courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: false },
        trackId: { type: Schema.Types.ObjectId, ref: 'Track', required: false },
        instructorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        duration: { type: Number, required: true, default: 30 },
        passScore: { type: Number, required: true, default: 50 },
        questions: [
            {
                text: { type: String, required: true },
                type: {
                    type: String,
                    enum: ['mcq', 'tf', 'essay'],
                    default: 'mcq',
                },
                options: [{ type: String }],
                correctAnswer: { type: Schema.Types.Mixed },
                points: { type: Number, default: 1 },
            },
        ],
    },
    {
        timestamps: true,
    }
);

export default mongoose.models.Exam || mongoose.model<IExam>('Exam', ExamSchema);
