import fs from 'fs';
import mongoose from 'mongoose';

// Load .env.local
const envFile = fs.readFileSync('.env.local', 'utf8');
let uri = '';
envFile.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed.startsWith('MONGODB_URI=')) {
        uri = trimmed.substring('MONGODB_URI='.length).trim();
    }
});

console.log('=== MONGODB CONNECTION DIAGNOSTIC ===\n');

if (!uri) {
    console.error('❌ MONGODB_URI is empty or missing in .env.local');
    process.exit(1);
}

const match = uri.match(/^mongodb(?:\+srv)?:\/\/([^:]+):([^@]+)@([^\/]+)\/([^?]+)/);
if (!match) {
    console.error('❌ MONGODB_URI format is invalid. Expected format:');
    console.error('mongodb+srv://<username>:<password>@<cluster>/<database>?appName=...');
    process.exit(1);
}

const [, user, pass, host, dbName] = match;
console.log(`Username: ${user}`);
console.log(`Host: ${host}`);
console.log(`Database: ${dbName}`);
console.log(`Password length: ${pass.length} chars`);

// Check special characters
const rawSpecialChars = pass.split('').filter(c => /[^a-zA-Z0-9]/.test(c));
if (rawSpecialChars.length > 0) {
    console.warn(`⚠️ Warning: Password contains characters that may require URL encoding: ${rawSpecialChars.join(' ')}`);
    console.warn(`   If connection fails, encode them (e.g., @ -> %40, # -> %23, : -> %3A) or use an alphanumeric-only password.`);
}

console.log('\nTesting connection to Atlas...');
mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 })
    .then(async () => {
        console.log('✅ SUCCESS: Connected to MongoDB Atlas successfully!');
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log(`✅ Verified access to database "${dbName}" (${collections.length} collections found).`);
        await mongoose.disconnect();
        process.exit(0);
    })
    .catch(err => {
        console.error('\n❌ FAILED: MongoDB error:');
        console.error(`   ${err.name}: ${err.message}`);
        if (err.message.includes('authentication failed')) {
            console.error('\n💡 Root cause: The password or username in MONGODB_URI does not match the user in Atlas.');
            console.error('   1. Go to cloud.mongodb.com -> Database Access');
            console.error(`   2. Edit user "${user}" and set a new password.`);
            console.error('   3. Put the exact same password into .env.local and Vercel Environment Variables.');
        }
        process.exit(1);
    });
