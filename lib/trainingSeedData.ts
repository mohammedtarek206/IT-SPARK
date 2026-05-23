/**
 * Legacy trainings that were previously hardcoded on /training-courses.
 * Used once to seed the database for admin management.
 */

export interface TrainingSeedItem {
    title: string;
    shortDescription: string;
    description: string;
    hours: number;
    days: number;
    type: 'Online' | 'Offline' | 'Hybrid';
    price: number;
    isFree: boolean;
    seats: number;
    location: string;
    thumbnail: string;
    category: string;
    isActive: boolean;
}

function parseType(raw: string): 'Online' | 'Offline' | 'Hybrid' {
    const lower = raw.toLowerCase();
    if (lower.includes('online') && lower.includes('offline')) return 'Hybrid';
    if (lower.includes('online')) return 'Online';
    return 'Offline';
}

function parseDuration(duration: string): { days: number; hours: number } {
    const m = duration.match(/([\d.]+)\s*Month/i);
    if (m) {
        const months = parseFloat(m[1]);
        return { days: Math.round(months * 30), hours: Math.round(months * 40) };
    }
    return { days: 30, hours: 40 };
}

const LEGACY_RAW: {
    title: string;
    category: string;
    duration: string;
    type: string;
    image: string;
}[] = [
    { title: 'IC3', category: 'Business', duration: '1 Month', type: 'Offline', image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1536&h=1024&fit=crop' },
    { title: 'ICDL', category: 'Business', duration: '2 Months', type: 'Offline', image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=1536&h=1024&fit=crop' },
    { title: 'MOS', category: 'Business', duration: '1.5 Months', type: 'Offline', image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=1536&h=1024&fit=crop' },
    { title: 'ICDL Teacher', category: 'Business', duration: '2 Months', type: 'Offline', image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=1536&h=1024&fit=crop' },
    { title: 'Advanced Excel', category: 'Business', duration: '1 Month', type: 'Offline / Online', image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1536&h=1024&fit=crop' },
    { title: 'AC5', category: 'Business', duration: '1 Month', type: 'Offline', image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=1536&h=1024&fit=crop' },
    { title: 'Digital Marketing', category: 'Business', duration: '2 Months', type: 'Online / Offline', image: 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?q=80&w=1536&h=1024&fit=crop' },
    { title: 'HR', category: 'Business', duration: '2 Months', type: 'Online / Offline', image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1536&h=1024&fit=crop' },
    { title: 'English Beginner', category: 'Languages', duration: '3 Months', type: 'Offline', image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=1536&h=1024&fit=crop' },
    { title: 'English Intermediate', category: 'Languages', duration: '3 Months', type: 'Offline', image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=1536&h=1024&fit=crop' },
    { title: 'English Advanced', category: 'Languages', duration: '3 Months', type: 'Offline', image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1536&h=1024&fit=crop' },
    { title: 'Mobile Maintenance', category: 'Networks', duration: '2 Months', type: 'Offline', image: 'https://images.unsplash.com/photo-1588508065123-287b28e013da?q=80&w=1536&h=1024&fit=crop' },
    { title: 'Graphic Diploma', category: 'Graphic Design', duration: '4 Months', type: 'Offline', image: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?q=80&w=1536&h=1024&fit=crop' },
    { title: 'Photoshop', category: 'Graphic Design', duration: '1 Month', type: 'Offline / Online', image: 'https://images.unsplash.com/photo-1561089489-013d3a1f11a8?q=80&w=1536&h=1024&fit=crop' },
    { title: 'Illustrator', category: 'Graphic Design', duration: '1 Month', type: 'Offline / Online', image: 'https://images.unsplash.com/photo-1626785774625-ddcddc3445e9?q=80&w=1536&h=1024&fit=crop' },
    { title: 'InDesign', category: 'Graphic Design', duration: '1 Month', type: 'Offline / Online', image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1536&h=1024&fit=crop' },
    { title: 'Python Programming', category: 'Programming', duration: '2 Months', type: 'Offline / Online', image: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=1536&h=1024&fit=crop' },
    { title: 'Kids Courses', category: 'Kids', duration: '1.5 Months', type: 'Offline', image: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?q=80&w=1536&h=1024&fit=crop' },
    { title: 'Data Analysis', category: 'Programming', duration: '3 Months', type: 'Online / Offline', image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1536&h=1024&fit=crop' },
    { title: 'TOT', category: 'Business', duration: '1.5 Months', type: 'Offline', image: 'https://images.unsplash.com/photo-1544531586-fde5298cdd40?q=80&w=1536&h=1024&fit=crop' },
    { title: 'ODOO', category: 'Business', duration: '2 Months', type: 'Offline / Online', image: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?q=80&w=1536&h=1024&fit=crop' },
    { title: 'React Frontend', category: 'Programming', duration: '3 Months', type: 'Offline / Online', image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=1536&h=1024&fit=crop' },
    { title: 'Angular Frontend', category: 'Programming', duration: '3 Months', type: 'Offline / Online', image: 'https://images.unsplash.com/photo-1605379399642-870262d3d051?q=80&w=1536&h=1024&fit=crop' },
    { title: 'Mobile App Development', category: 'Programming', duration: '4 Months', type: 'Offline / Online', image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=1536&h=1024&fit=crop' },
    { title: 'Full Stack .NET', category: 'Programming', duration: '6 Months', type: 'Offline / Online', image: 'https://images.unsplash.com/photo-1618477388954-7852f32655c7?q=80&w=1536&h=1024&fit=crop' },
    { title: 'Microsoft Machine Learning', category: 'AI', duration: '4 Months', type: 'Online', image: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?q=80&w=1536&h=1024&fit=crop' },
    { title: 'Artificial Intelligence', category: 'AI', duration: '5 Months', type: 'Online / Offline', image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=1536&h=1024&fit=crop' },
    { title: 'Cyber Security', category: 'Networks', duration: '4 Months', type: 'Offline / Online', image: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?q=80&w=1536&h=1024&fit=crop' },
    { title: 'CCNA', category: 'Networks', duration: '2 Months', type: 'Offline', image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=1536&h=1024&fit=crop' },
    { title: 'MCSA', category: 'Networks', duration: '2 Months', type: 'Offline', image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1536&h=1024&fit=crop' },
];

export const LEGACY_TRAINING_SEED: TrainingSeedItem[] = LEGACY_RAW.map((item) => {
    const { days, hours } = parseDuration(item.duration);
    const trainingType = parseType(item.type);
    const short = `${item.title} — تدريب ${item.category} (${item.duration})`;
    return {
        title: item.title,
        shortDescription: short,
        description: `${short}\n\nنوع التدريب: ${item.type}\nالمدة: ${item.duration}\n\nتدريب معتمد من IT-SPARK.`,
        hours,
        days,
        type: trainingType,
        price: 0,
        isFree: false,
        seats: 30,
        location: trainingType === 'Online' ? '' : 'IT-SPARK Center',
        thumbnail: item.image,
        category: item.category,
        isActive: true,
    };
});

export const LEGACY_TRAINING_TITLES = LEGACY_RAW.map((t) => t.title);
