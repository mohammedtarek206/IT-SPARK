import mongoose, { Document, Schema } from 'mongoose';

export interface ILesson extends Document {
    title: string;
    module: mongoose.Types.ObjectId;
    type: 'video' | 'pdf' | 'exam';
    contentUrl?: string; // Video URL or PDF URL
    description?: string;
    order: number;
    duration?: string;
    createdAt: Date;
    updatedAt: Date;
}

const LessonSchema: Schema = new Schema(
    {
        title: { type: String, required: true },
        module: { type: Schema.Types.ObjectId, ref: 'Module', required: true },
        type: {
            type: String,
            enum: ['video', 'pdf', 'exam'],
            default: 'video',
        },
        contentUrl: { type: String },
        description: { type: String },
        order: { type: Number, default: 0 },
        duration: { type: String },
    },
    {
        timestamps: true,
    }
);

export default mongoose.models.Lesson || mongoose.model<ILesson>('Lesson', LessonSchema);
