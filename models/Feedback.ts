import mongoose, { Document, Schema } from 'mongoose';

export interface IFeedback extends Document {
  studentName: string;
  course: string;
  comment: string;
  rating: number;
  imageUrl?: string;
  published: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const FeedbackSchema: Schema = new Schema(
  {
    studentName: { type: String, required: true },
    course: { type: String, default: '' },
    comment: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    imageUrl: { type: String },
    published: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

FeedbackSchema.index({ published: 1, order: 1 });

// Clear model cache to avoid stale schema
if (mongoose.models.Feedback) {
  delete mongoose.models.Feedback;
}

export default mongoose.model<IFeedback>('Feedback', FeedbackSchema);
