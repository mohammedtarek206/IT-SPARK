import mongoose from 'mongoose';
import * as fs from 'fs';
import JobApplication from './models/JobApplication';
import Job from './models/Job';

async function testApi() {
    const env = fs.readFileSync('.env.local', 'utf-8');
    const uriMatch = env.match(/MONGODB_URI=(.*)/);
    const uri = uriMatch ? uriMatch[1] : null;

    if (!uri) throw new Error("No MONGODB_URI");

    await mongoose.connect(uri);

    try {
        const page = 1;
        const limit = 15;
        const search = '';
        const status = '';

        const filter: any = {};
        if (search) {
            const regex = new RegExp(search, 'i');
            filter.$or = [
                { fullName: regex },
                { phone: regex },
                { email: regex },
                { university: regex },
            ];
        }
        if (status) {
            filter.status = status;
        }

        const total = await JobApplication.countDocuments(filter);
        const applications = await JobApplication.find(filter)
            .populate('job', 'title company')
            .select('-resumeUrl')
            .sort({ appliedAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        console.log("Success:", applications.length, "total:", total);
        if (applications.length > 0) {
            console.log("Populated job:", applications[0].job);
        }
    } catch (error) {
        console.error("Caught exception:");
        console.error(error);
    } finally {
        await mongoose.disconnect();
    }
}

testApi();
