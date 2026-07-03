import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Feedback from '@/models/Feedback';

const seedData = [
    {
        name: 'أحمد محمود',
        role: 'Full Stack Developer',
        text: 'بفضل تدريب IT-SPARK، تمكنت من بناء خبرة عملية قوية مكنتني من الحصول على وظيفة في شركة تقنية عالمية بعد التخرج مباشرة.',
        rating: 5,
        isVisible: true,
        order: 1
    },
    {
        name: 'سارة خالد',
        role: 'UI/UX Designer',
        text: 'الكورسات هنا لا تعتمد على النظريات فقط، بل على التطبيق العملي المستمر مما أهلني لبناء بورتفوليو قوي وبدء عملي الحر.',
        rating: 5,
        isVisible: true,
        order: 2
    },
    {
        name: 'John Doe',
        role: 'Data Scientist',
        text: 'The AI bootcamp was incredible. It provided me with the tools I needed to pivot my career into data science successfully.',
        rating: 5,
        isVisible: true,
        order: 3
    }
];

export async function GET() {
    try {
        await connectDB();
        
        // Check if data already exists
        const count = await Feedback.countDocuments();
        if (count > 0) {
            return NextResponse.json({ message: 'Database already seeded with feedbacks' });
        }

        await Feedback.insertMany(seedData);
        return NextResponse.json({ message: 'Seed data inserted successfully' });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to seed database' }, { status: 500 });
    }
}
