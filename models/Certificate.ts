import mongoose, { Document, Schema } from 'mongoose';

export interface ICertificate extends Document {
    studentId: mongoose.Types.ObjectId;
    courseId: mongoose.Types.ObjectId;
    examId: mongoose.Types.ObjectId; // Reference to the exam that granted this
    title: string;
    issuer: string;
    grade: string;
    issueDate: Date;
    credentialId: string;
}

const CertificateSchema: Schema = new Schema(
    {
        studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: false },
        trackId: { type: Schema.Types.ObjectId, ref: 'Track', required: false },
        examId: { type: Schema.Types.ObjectId, ref: 'Exam', required: true },
        title: { type: String, required: true },
        issuer: { type: String, default: 'Arqam Academy' },
        grade: { type: String, required: true },
        issueDate: { type: Date, default: Date.now },
        credentialId: { type: String, required: true, unique: true },
    },
    {
        timestamps: true,
    }
);

export default mongoose.models.Certificate || mongoose.model<ICertificate>('Certificate', CertificateSchema);
