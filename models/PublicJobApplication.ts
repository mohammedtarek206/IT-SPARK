import mongoose, { Document, Schema } from 'mongoose';

export interface IPublicJobApplication extends Document {
    name: string;
    phone: string;
    email?: string;
    course: string;
    preferredTime?: string;
    status: 'new' | 'contacted' | 'accepted' | 'rejected';
    createdAt: Date;
    updatedAt: Date;
}

const PublicJobApplicationSchema = new Schema<IPublicJobApplication>(
    {
        name: { type: String, required: true, trim: true },
        phone: { type: String, required: true, trim: true },
        email: { type: String, trim: true },
        course: { type: String, required: true, trim: true },
        preferredTime: { type: String, trim: true },
        status: {
            type: String,
            enum: ['new', 'contacted', 'accepted', 'rejected'],
            default: 'new',
        },
    },
    { timestamps: true }
);

PublicJobApplicationSchema.index({ status: 1, createdAt: -1 });
PublicJobApplicationSchema.index({ course: 1 });

export default mongoose.models.PublicJobApplication ||
    mongoose.model<IPublicJobApplication>('PublicJobApplication', PublicJobApplicationSchema);
