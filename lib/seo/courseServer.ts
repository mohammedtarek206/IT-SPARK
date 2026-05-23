import connectDB from '@/lib/mongodb';
import Course from '@/models/Course';
import { courseParamFilter, getCourseSlug, slugify } from './slug';

export async function findPublicCourse(param: string) {
  await connectDB();
  const filter = courseParamFilter(param);
  let course = await Course.findOne({ ...filter, isActive: true, status: 'published' })
    .populate('instructor', 'name bio profileImage')
    .lean();

  if (!course && !('_id' in filter)) {
    course = await Course.findOne({
      isActive: true,
      status: 'published',
      title: new RegExp(`^${param.replace(/-/g, ' ')}$`, 'i'),
    })
      .populate('instructor', 'name bio profileImage')
      .lean();
  }

  return course;
}

/** Ensure persisted slug for SEO URLs */
export async function ensureCourseSlug(
  courseId: string,
  title: string,
  existingSlug?: string | null
): Promise<string> {
  await connectDB();
  if (existingSlug?.trim()) return existingSlug.trim();

  let base = slugify(title);
  let candidate = base;
  let n = 0;

  while (true) {
    const taken = await Course.findOne({
      slug: candidate,
      _id: { $ne: courseId },
    }).select('_id');
    if (!taken) break;
    n += 1;
    candidate = `${base}-${n}`;
  }

  await Course.findByIdAndUpdate(courseId, { slug: candidate });
  return candidate;
}

export async function backfillMissingSlugs(limit = 200) {
  if (!process.env.MONGODB_URI) return;
  await connectDB();
  const courses = await Course.find({
    $or: [{ slug: { $exists: false } }, { slug: null }, { slug: '' }],
  })
    .select('_id title slug')
    .limit(limit)
    .lean();

  for (const c of courses) {
    await ensureCourseSlug(String(c._id), c.title, c.slug);
  }
}

export { getCourseSlug, getCoursePath } from './slug';
