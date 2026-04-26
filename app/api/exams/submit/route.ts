import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Exam from '@/models/Exam';
import ExamResult from '@/models/ExamResult';
import Certificate from '@/models/Certificate';
import { authenticateRequest } from '@/lib/auth';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
    try {
        const user = await authenticateRequest(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { examId, answers } = await request.json();
        await connectDB();

        const exam = await Exam.findById(examId);
        if (!exam) {
            return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
        }

        if (!Array.isArray(answers) || answers.length !== exam.questions.length) {
            return NextResponse.json({ error: 'Invalid answers format' }, { status: 400 });
        }

        let totalPointsPossible = 0;
        let earnedPoints = 0;
        let pendingReview = false;

        exam.questions.forEach((q: any, idx: number) => {
            const studentAnswer = answers[idx];
            const points = q.points || 1;

            // Essay questions can't be auto-graded; need manual review
            if (q.type === 'essay') {
                pendingReview = true;
                totalPointsPossible += points;
                return; // skip auto-grading
            }

            totalPointsPossible += points;

            // Grading logic for MCQ and TF
            if (q.type === 'mcq') {
                // If the correct answer is text or index
                if (studentAnswer === q.correctAnswer || studentAnswer === q.options[q.correctAnswer]) {
                    earnedPoints += points;
                }
            } else if (q.type === 'tf') {
                // Assuming correctAnswer is stored as 'true' or 'false'
                if (String(studentAnswer).toLowerCase() === String(q.correctAnswer).toLowerCase()) {
                    earnedPoints += points;
                }
            }
        });

        // Calculate score percentage so far (excluding essays which will be graded later)
        const score = totalPointsPossible > 0 ? Math.round((earnedPoints / totalPointsPossible) * 100) : 0;

        let status = 'Pending';
        if (!pendingReview) {
            status = score >= exam.passScore ? 'Pass' : 'Fail';
        }

        const result = await ExamResult.create({
            studentId: user.userId,
            examId: exam._id,
            score,
            answers,
            status,
            pendingReview
        });

        // 🏆 Certificate Generation Logic
        if (status === 'Pass') {
            // Check if certificate already exists to prevent duplicates
            const existingCert = await Certificate.findOne({
                studentId: user.userId,
                examId: exam._id,
            });

            if (!existingCert) {
                const credentialId = crypto.randomUUID().split('-')[0].toUpperCase() + Date.now().toString().slice(-4);

                await Certificate.create({
                    studentId: user.userId,
                    courseId: exam.courseId || undefined,
                    trackId: exam.trackId || undefined,
                    examId: exam._id,
                    title: `Certificate of Completion: ${exam.title}`,
                    grade: `${score}%`,
                    credentialId,
                });
            }
        }

        return NextResponse.json(result, { status: 201 });
    } catch (error: any) {
        console.error('Submission error:', error);
        return NextResponse.json({ error: 'Submission failed' }, { status: 500 });
    }
}
