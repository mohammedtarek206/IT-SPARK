/**
 * Seed Script - Creates the admin user in the database
 * Run with: node scripts/seed-admin.mjs
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Replace with your remote MongoDB URI
const MONGODB_URI = 'mongodb+srv://mt7592546_db_user:84UxtvjU0ddGlGEX@cluster0.vd1nml2.mongodb.net/?appName=Cluster0';

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

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: 'admin@arqam.academy' });
        if (existingAdmin) {
            console.log('✅ Admin account already exists!');
            console.log('📧 Email: admin@arqam.academy');
            console.log('🔑 Password: admin_arqam_123');
            await mongoose.disconnect();
            return;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash('admin_arqam_123', 12);

        // Create admin user
        const admin = await User.create({
            name: 'Admin Arqam',
            email: 'admin@arqam.academy',
            password: hashedPassword,
            role: 'admin',
            status: 'active',
        });

        console.log('');
        console.log('🎉 Admin account created successfully!');
        console.log('================================');
        console.log('📧 Email:    admin@arqam.academy');
        console.log('🔑 Password: admin_arqam_123');
        console.log('================================');
        console.log('');
        console.log('Go to http://localhost:3000/login to sign in.');

    } catch (error) {
        console.error('❌ Error creating admin:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB.');
    }
}

main();
