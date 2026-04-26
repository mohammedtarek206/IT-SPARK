import mongoose, { Document, Schema } from 'mongoose';

export interface ICourse extends Document {
    title: string;
    description: string;
    thumbnail?: string;
    track: mongoose.Types.ObjectId;
    instructor: mongoose.Types.ObjectId;
    level: 'Beginner' | 'Intermediate' | 'Advanced';
    price: number;
    isFree: boolean;
    passingGrade: number; // For certificate
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const CourseSchema: Schema = new Schema(
    {
        title: { type: String, required: true },
        description: { type: String, required: true },
        thumbnail: { type: String },
        track: { type: Schema.Types.ObjectId, ref: 'Track', required: true },
        instructor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        level: {
            type: String,
            enum: ['Beginner', 'Intermediate', 'Advanced'],
            default: 'Beginner',
        },
        price: { type: Number, default: 0 },
        isFree: { type: Boolean, default: false },
        passingGrade: { type: Number, default: 70 },
        isActive: { type: Boolean, default: false }, // Requires admin approval or set by instructor
    },
    {
        timestamps: true,
    }
);

export default mongoose.models.Course || mongoose.model<ICourse>('Course', CourseSchema);
