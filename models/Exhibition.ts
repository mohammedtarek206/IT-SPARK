import mongoose, { Document, Schema } from 'mongoose';

export interface IExhibition extends Document {
    title: string;
    description: string;
    imageUrl: string;
    studentName: string;
    demoUrl?: string;
    createdAt: Date;
    updatedAt: Date;
}

const ExhibitionSchema: Schema = new Schema(
    {
        title: { type: String, required: true },
        description: { type: String, required: true },
        imageUrl: { type: String, required: true },
        studentName: { type: String, required: true },
        demoUrl: { type: String },
    },
    {
        timestamps: true,
    }
);

// Prevent mongoose overwrite model error
if (mongoose.models.Exhibition) {
    delete mongoose.models.Exhibition;
}

export default mongoose.models.Exhibition || mongoose.model<IExhibition>('Exhibition', ExhibitionSchema);
