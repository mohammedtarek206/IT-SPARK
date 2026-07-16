import mongoose, { Document, Schema } from 'mongoose';

export interface IVocationalTraining extends Document {
  title: string;
  description: string;
  imageUrl?: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const VocationalTrainingSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    imageUrl: { type: String },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

VocationalTrainingSchema.index({ isActive: 1, order: 1 });

if (mongoose.models.VocationalTraining) {
  delete mongoose.models.VocationalTraining;
}

export default mongoose.model<IVocationalTraining>('VocationalTraining', VocationalTrainingSchema);
