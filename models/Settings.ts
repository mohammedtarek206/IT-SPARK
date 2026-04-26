import mongoose, { Schema, Document } from 'mongoose';

export interface ISettings extends Document {
    key: string;
    value: any;
    updatedBy: mongoose.Types.ObjectId;
}

const SettingsSchema: Schema = new Schema({
    key: { type: String, required: true, unique: true },
    value: { type: Schema.Types.Mixed, required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, {
    timestamps: true
});

export default mongoose.models.Settings || mongoose.model<ISettings>('Settings', SettingsSchema);
