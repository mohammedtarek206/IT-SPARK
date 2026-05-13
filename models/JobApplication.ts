import mongoose, { Document, Schema } from 'mongoose';

export interface IJobApplication extends Document {
    job: mongoose.Types.ObjectId;
    user: mongoose.Types.ObjectId;
    fullName: string;
    phone: string;
    nationalId: string;
    resumeUrl: string;
    coverLetter?: string;
    status: 'Pending' | 'Reviewed' | 'Shortlisted' | 'Rejected' | 'Accepted';
    appliedAt: Date;
}

const JobApplicationSchema: Schema = new Schema(
    {
        job: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        fullName: { type: String, required: true },
        phone: { type: String, required: true },
        nationalId: { type: String, required: true },
        resumeUrl: { type: String, required: true },
        coverLetter: { type: String },
        status: {
            type: String,
            enum: ['Pending', 'Reviewed', 'Shortlisted', 'Rejected', 'Accepted'],
            default: 'Pending',
        },
    },
    {
        timestamps: { createdAt: 'appliedAt', updatedAt: true },
    }
);

export default mongoose.models.JobApplication || mongoose.model<IJobApplication>('JobApplication', JobApplicationSchema);
