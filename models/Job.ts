import mongoose, { Document, Schema } from 'mongoose';

export interface IJob extends Document {
    title: string;
    company: string;
    description: string;
    requirements: string[];
    location: string;
    type: 'Full-time' | 'Part-time' | 'Contract' | 'Freelance' | 'Internship';
    salary?: string;
    link?: string; // External application link if any
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
        type: {
            type: String,
            enum: ['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship'],
            default: 'Full-time',
        },
        salary: { type: String },
        link: { type: String },
        isActive: { type: Boolean, default: true },
    },
    {
        timestamps: true,
    }
);

export default mongoose.models.Job || mongoose.model<IJob>('Job', JobSchema);
