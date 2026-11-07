import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';

// Load .env.local
const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
        const idx = trimmed.indexOf('=');
        if (idx > -1) {
            env[trimmed.substring(0, idx).trim()] = trimmed.substring(idx + 1).trim();
        }
    }
});

const uri = env.MONGODB_URI;
if (!uri) {
    console.error('MONGODB_URI not found in .env.local');
    process.exit(1);
}

async function backup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(process.cwd(), 'backups', `mongo-backup-${timestamp}`);
    fs.mkdirSync(backupDir, { recursive: true });

    console.log(`Connecting to MongoDB Atlas...`);
    await mongoose.connect(uri);
    console.log(`Connected successfully.`);

    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log(`Found ${collections.length} collections.`);

    const manifest = {
        timestamp: new Date().toISOString(),
        collections: {},
        totalDocuments: 0
    };

    for (const colInfo of collections) {
        const colName = colInfo.name;
        const col = db.collection(colName);
        const docs = await col.find({}).toArray();
        const filePath = path.join(backupDir, `${colName}.json`);
        fs.writeFileSync(filePath, JSON.stringify(docs, null, 2), 'utf8');
        console.log(`- ${colName}: ${docs.length} documents saved to ${colName}.json`);
        manifest.collections[colName] = {
            count: docs.length,
            file: `${colName}.json`,
            sizeBytes: fs.statSync(filePath).size
        };
        manifest.totalDocuments += docs.length;
    }

    fs.writeFileSync(path.join(backupDir, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');
    console.log(`\nBackup verified and completed!`);
    console.log(`Total collections: ${collections.length}`);
    console.log(`Total documents: ${manifest.totalDocuments}`);
    console.log(`Backup location: ${backupDir}`);

    await mongoose.disconnect();
}

backup().catch(err => {
    console.error('Backup failed:', err);
    process.exit(1);
});
