import mongoose, { Document, Schema } from 'mongoose';

export interface IPartner extends Document {
  name: string;
  logoUrl: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PartnerSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    logoUrl: { type: String, required: true },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

PartnerSchema.index({ order: 1, isActive: 1 });

export default mongoose.models.Partner || mongoose.model<IPartner>('Partner', PartnerSchema);
