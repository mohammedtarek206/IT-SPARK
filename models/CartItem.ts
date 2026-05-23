import mongoose, { Document, Schema } from 'mongoose';

export interface ICartItem extends Document {
    user: mongoose.Types.ObjectId;
    course: mongoose.Types.ObjectId;
    amount: number;
    status: 'active' | 'removed' | 'checked_out';
    createdAt: Date;
    updatedAt: Date;
}

const CartItemSchema: Schema = new Schema(
    {
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
        amount: { type: Number, default: 0 },
        status: {
            type: String,
            enum: ['active', 'removed', 'checked_out'],
            default: 'active',
        },
    },
    { timestamps: true }
);

CartItemSchema.index({ user: 1, course: 1 }, { unique: true });

export default mongoose.models.CartItem || mongoose.model<ICartItem>('CartItem', CartItemSchema);
