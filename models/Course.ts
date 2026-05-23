import mongoose, { Document, Schema } from 'mongoose';

export interface ICourse extends Document {
    title: string;
    slug?: string;
    shortDescription: string;
    description: string;
    whatYouWillLearn: string[];
    requirements: string[];
    targetAudience: string[];
    thumbnail?: string;
    previewVideoUrl?: string;
    instructor: mongoose.Types.ObjectId;
    level: 'Beginner' | 'Intermediate' | 'Advanced';
    language: string;
    category: string;
    hours: number;
    lecturesCount: number;
    durationText: string;
    type: 'Online' | 'Offline' | 'Hybrid';
    price: number;
    isFree: boolean;
    discountPrice?: number;
    passingGrade: number; // For certificate
    isActive: boolean; // True means visible to students
    status: 'draft' | 'published' | 'rejected'; // For admin control
    rating: number;
    reviewsCount: number;
    studentsCount: number;
    modules: {
        title: string;
        order: number;
        lessons: {
            title: string;
            description: string;
            duration: string;
            videoUrl: string;
            order: number;
        }[];
    }[];
    createdAt: Date;
    updatedAt: Date;
}

const LessonSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String },
    duration: { type: String },
    videoUrl: { type: String },
    order: { type: Number, required: true },
});

const ModuleSchema = new Schema({
    title: { type: String, required: true },
    order: { type: Number, required: true },
    lessons: [LessonSchema],
});

const CourseSchema: Schema = new Schema(
    {
        title: { type: String, required: true },
        slug: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
        shortDescription: { type: String, required: true },
        description: { type: String, required: true },
        whatYouWillLearn: [{ type: String }],
        requirements: [{ type: String }],
        targetAudience: [{ type: String }],
        thumbnail: { type: String },
        previewVideoUrl: { type: String },
        instructor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        level: {
            type: String,
            enum: ['Beginner', 'Intermediate', 'Advanced'],
            default: 'Beginner',
        },
        language: { type: String, default: 'Arabic' },
        category: { type: String, required: true },
        hours: { type: Number, default: 0 },
        lecturesCount: { type: Number, default: 0 },
        durationText: { type: String, required: true },
        type: {
            type: String,
            enum: ['Online', 'Offline', 'Hybrid'],
            default: 'Online',
        },
        price: { type: Number, default: 0 },
        isFree: { type: Boolean, default: false },
        discountPrice: { type: Number },
        passingGrade: { type: Number, default: 70 },
        isActive: { type: Boolean, default: true },
        status: { type: String, enum: ['draft', 'published', 'rejected'], default: 'published' },
        rating: { type: Number, default: 0 },
        reviewsCount: { type: Number, default: 0 },
        studentsCount: { type: Number, default: 0 },
        modules: [ModuleSchema],
    },
    {
        timestamps: true,
    }
);

export default mongoose.models.Course || mongoose.model<ICourse>('Course', CourseSchema);
