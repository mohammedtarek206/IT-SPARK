import mongoose, { Document, Schema } from 'mongoose';

export interface IExamResult extends Document {
    studentId: mongoose.Types.ObjectId;
    examId: mongoose.Types.ObjectId;
    score: number;
    answers: any[]; // Changed from number[] to any[] to support strings for TF/Essay
    status: 'Pass' | 'Fail' | 'Pending';
    pendingReview: boolean; // Indicates if essay questions need manual grading
    completedAt: Date;
}

const ExamResultSchema: Schema = new Schema(
    {
        studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        examId: { type: Schema.Types.ObjectId, ref: 'Exam', required: true },
        score: { type: Number, required: true, default: 0 },
        answers: [{ type: Schema.Types.Mixed, required: true }],
        status: {
            type: String,
            enum: ['Pass', 'Fail', 'Pending'],
            required: true,
            default: 'Pending'
        },
        pendingReview: { type: Boolean, default: false },
        completedAt: { type: Date, default: Date.now },
    },
    {
        timestamps: true,
    }
);

ExamResultSchema.index({ studentId: 1 });
ExamResultSchema.index({ examId: 1 });
ExamResultSchema.index({ completedAt: -1 });

export default mongoose.models.ExamResult || mongoose.model<IExamResult>('ExamResult', ExamResultSchema);
