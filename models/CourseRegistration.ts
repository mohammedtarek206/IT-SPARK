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
    status: 'new' | 'contacted' | 'registered' | 'cancelled';
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
        status: {
            type: String,
            enum: ['new', 'contacted', 'registered', 'cancelled'],
            default: 'new',
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.models.CourseRegistration || mongoose.model<ICourseRegistration>('CourseRegistration', CourseRegistrationSchema);
