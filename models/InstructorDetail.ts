import mongoose, { Document, Schema } from 'mongoose';

export interface IInstructorDetail extends Document {
    user: mongoose.Types.ObjectId;
    bio: string;
    cvUrl?: string;
    imageUrl?: string;
    category: string;
    approvalStatus: 'pending' | 'approved' | 'rejected';
    createdAt: Date;
    updatedAt: Date;
}

const InstructorDetailSchema: Schema = new Schema(
    {
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        bio: { type: String, required: true },
        cvUrl: { type: String },
        imageUrl: { type: String },
        category: { type: String, required: true },
        approvalStatus: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending',
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.models.InstructorDetail || mongoose.model<IInstructorDetail>('InstructorDetail', InstructorDetailSchema);
