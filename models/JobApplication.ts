import mongoose, { Document, Schema } from 'mongoose';

export interface IJobApplication extends Document {
    job: mongoose.Types.ObjectId;
    fullName: string;
    phone: string;
    email?: string;
    university?: string;
    academicYear?: string;
    major?: string;
    governorate?: string;
    resumeUrl?: string;
    notes?: string;
    status: 'New' | 'Reviewed' | 'Interview' | 'Accepted' | 'Rejected';
    appliedAt: Date;
}

const JobApplicationSchema: Schema = new Schema(
    {
        job: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
        fullName: { type: String, required: true },
        phone: { type: String, required: true },
        email: { type: String },
        university: { type: String },
        academicYear: { type: String },
        major: { type: String },
        governorate: { type: String },
        resumeUrl: { type: String },
        notes: { type: String },
        status: {
            type: String,
            enum: ['New', 'Reviewed', 'Interview', 'Accepted', 'Rejected'],
            default: 'New',
        },
    },
    {
        timestamps: { createdAt: 'appliedAt', updatedAt: true },
    }
);

export default mongoose.models.JobApplication || mongoose.model<IJobApplication>('JobApplication', JobApplicationSchema);
