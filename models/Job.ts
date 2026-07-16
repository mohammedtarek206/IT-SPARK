import mongoose, { Document, Schema } from 'mongoose';

export interface IJob extends Document {
    title: string;
    company: string;
    description: string;
    requirements: string[];
    location: string;
    department?: string;
    type: 'Full-time' | 'Part-time' | 'Contract' | 'Freelance' | 'Internship';
    workMode: 'Remote' | 'Hybrid' | 'Onsite';
    salary?: string;
    link?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const JobSchema: Schema = new Schema(
    {
        title: { type: String, required: true },
        company: { type: String, required: true },
        description: { type: String, required: true },
        requirements: [{ type: String }],
        location: { type: String, required: true },
        department: { type: String },
        type: {
            type: String,
            enum: ['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship'],
            default: 'Full-time',
        },
        workMode: {
            type: String,
            enum: ['Remote', 'Hybrid', 'Onsite'],
            default: 'Onsite',
        },
        salary: { type: String },
        link: { type: String },
        isActive: { type: Boolean, default: true },
    },
    {
        timestamps: true,
    }
);

JobSchema.index({ isActive: 1, createdAt: -1 });
JobSchema.index({ title: 'text', company: 'text', description: 'text' });

export default mongoose.models.Job || mongoose.model<IJob>('Job', JobSchema);
