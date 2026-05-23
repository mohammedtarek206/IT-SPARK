import mongoose, { Document, Schema } from 'mongoose';

export interface ICourseRegistration extends Document {
    full_name: string;
    phone: string;
    email?: string;
    university: string;
    academic_year: string;
    governorate: string;
    notes?: string;
    course_name: string;
    training?: mongoose.Types.ObjectId;
    status: 'new' | 'contacted' | 'accepted' | 'rejected';
    createdAt: Date;
    updatedAt: Date;
}

const CourseRegistrationSchema: Schema = new Schema(
    {
        full_name: { type: String, required: true },
        phone: { type: String, required: true },
        email: { type: String },
        university: { type: String, required: true },
        academic_year: { type: String, required: true },
        governorate: { type: String, required: true },
        notes: { type: String },
        course_name: { type: String, required: true },
        training: { type: Schema.Types.ObjectId, ref: 'Training' },
        status: {
            type: String,
            enum: ['new', 'contacted', 'accepted', 'rejected'],
            default: 'new',
        },
    },
    { timestamps: true }
);

if (mongoose.models.CourseRegistration) {
    delete mongoose.models.CourseRegistration;
}

export default mongoose.model<ICourseRegistration>('CourseRegistration', CourseRegistrationSchema);
