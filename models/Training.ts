import mongoose, { Document, Schema } from 'mongoose';

export interface ITraining extends Document {
    title: string;
    shortDescription: string;
    description: string;
    hours: number;
    days: number;
    type: 'Online' | 'Offline' | 'Hybrid';
    price: number;
    isFree: boolean;
    seats: number;
    seats_total: number;
    seats_available: number;
    startDate?: Date;
    endDate?: Date;
    location?: string;
    thumbnail?: string;
    previewVideoUrl?: string;
    category: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const TrainingSchema: Schema = new Schema(
    {
        title: { type: String, required: true },
        shortDescription: { type: String, required: true },
        description: { type: String, required: true },
        hours: { type: Number, default: 0 },
        days: { type: Number, default: 0 },
        type: {
            type: String,
            enum: ['Online', 'Offline', 'Hybrid'],
            default: 'Offline',
        },
        price: { type: Number, default: 0 },
        isFree: { type: Boolean, default: false },
        seats: { type: Number, default: 0 },
        seats_total: { type: Number, default: 0 },
        seats_available: { type: Number, default: 0 },
        startDate: { type: Date },
        endDate: { type: Date },
        location: { type: String },
        thumbnail: { type: String },
        previewVideoUrl: { type: String },
        category: { type: String, default: 'General' },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

if (mongoose.models.Training) {
    delete mongoose.models.Training;
}

export default mongoose.model<ITraining>('Training', TrainingSchema);
