import mongoose, { Document, Schema } from 'mongoose';

export interface IGallery extends Document {
  title: string;
  category: string;
  imageUrl: string;
  type: string;
  videoUrl?: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const GallerySchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    category: { type: String, required: true }, // 'Events', 'Training', 'Workshops'
    imageUrl: { type: String, required: true },
    type: { type: String, default: 'image' }, // 'image' or 'video'
    videoUrl: { type: String },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

if (mongoose.models.Gallery) {
  delete mongoose.models.Gallery;
}

export default mongoose.models.Gallery || mongoose.model<IGallery>('Gallery', GallerySchema);
