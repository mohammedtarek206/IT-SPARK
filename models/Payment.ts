import mongoose, { Document, Schema } from 'mongoose';

export interface IPayment extends Document {
    user: mongoose.Types.ObjectId;
    course?: mongoose.Types.ObjectId;
    amount: number;
    method: 'Vodafone Cash' | 'InstaPay' | 'Visa' | 'Free' | 'manual';
    status: 'pending' | 'approved' | 'rejected';
    proofImage?: string; // Base64 or URL
    createdAt: Date;
    updatedAt: Date;
}

const PaymentSchema: Schema = new Schema(
    {
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        course: { type: Schema.Types.ObjectId, ref: 'Course', required: false },
        amount: { type: Number, required: true },
        method: {
            type: String,
            enum: ['Vodafone Cash', 'InstaPay', 'Visa', 'Free', 'manual'],
            required: true,
        },
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected', 'paid'],
            default: 'pending',
        },
        proofImage: { type: String, required: false },
    },
    {
        timestamps: true,
    }
);

// Clear mongoose models cache during development to apply schema changes
if (mongoose.models.Payment) {
    delete mongoose.models.Payment;
}

export default mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema);
