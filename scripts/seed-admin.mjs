/**
 * Secure Seed Script - Creates an admin user in the database
 * Run with: MONGODB_URI=... ADMIN_EMAIL=... ADMIN_PASSWORD=... node scripts/seed-admin.mjs
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGODB_URI = process.env.MONGODB_URI;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (!MONGODB_URI || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.error('❌ Missing environment variables. Please provide MONGODB_URI, ADMIN_EMAIL, and ADMIN_PASSWORD.');
    process.exit(1);
}

const UserSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, unique: true, required: true },
        phone: { type: String },
        password: { type: String },
        role: { type: String, enum: ['admin', 'student', 'instructor'], default: 'student' },
        status: { type: String, enum: ['active', 'pending', 'banned'], default: 'active' },
        accessCode: { type: String, unique: true, sparse: true },
        targetGoal: { type: String, enum: ['job', 'freelance', 'skill'] },
        interestedTrack: { type: String },
        points: { type: Number, default: 0 },
        level: { type: Number, default: 1 },
        badges: [{ badgeId: { type: String }, earnedAt: { type: Date, default: Date.now } }],
    },
    { timestamps: true }
);

const User = mongoose.models?.User || mongoose.model('User', UserSchema);

async function main() {
    try {
        console.log('🔗 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB!');

        const existingAdmin = await User.findOne({ email: ADMIN_EMAIL });
        if (existingAdmin) {
            console.log(`✅ Admin account (${ADMIN_EMAIL}) already exists!`);
            await mongoose.disconnect();
            return;
        }

        const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);

        await User.create({
            name: 'Platform Admin',
            email: ADMIN_EMAIL,
            password: hashedPassword,
            role: 'admin',
            status: 'active',
        });

        console.log(`🎉 Admin account (${ADMIN_EMAIL}) created successfully!`);
    } catch (error) {
        console.error('❌ Error creating admin:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB.');
    }
}

main();
