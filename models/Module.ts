import mongoose, { Document, Schema } from 'mongoose';

export interface IModule extends Document {
    title: string;
    course: mongoose.Types.ObjectId;
    order: number;
    createdAt: Date;
    updatedAt: Date;
}

const ModuleSchema: Schema = new Schema(
    {
        title: { type: String, required: true },
        course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
        order: { type: Number, default: 0 },
    },
    {
        timestamps: true,
    }
);

export default mongoose.models.Module || mongoose.model<IModule>('Module', ModuleSchema);
