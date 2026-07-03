import mongoose, { Document, Schema } from 'mongoose';

export interface IFeedback extends Document {
  name: string;
  role: string;
  text: string;
  rating: number;
  isVisible: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const FeedbackSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    role: { type: String, required: true },
    text: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    isVisible: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

if (mongoose.models.Feedback) {
  delete mongoose.models.Feedback;
}

export default mongoose.models.Feedback || mongoose.model<IFeedback>('Feedback', FeedbackSchema);
