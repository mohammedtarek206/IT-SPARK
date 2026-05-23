import mongoose from 'mongoose';

/** URL-safe slug from title */
export function slugify(text: string): string {
  return text
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^\w\s\u0600-\u06FF-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80) || 'course';
}

export function isObjectId(value: string): boolean {
  return mongoose.Types.ObjectId.isValid(value) && String(new mongoose.Types.ObjectId(value)) === value;
}

export function getCourseSlug(course: {
  slug?: string | null;
  title: string;
  _id?: { toString(): string } | string;
}): string {
  if (course.slug?.trim()) return course.slug.trim();
  const base = slugify(course.title);
  const id =
    typeof course._id === 'string' ? course._id.slice(-6) : course._id?.toString().slice(-6);
  return id ? `${base}-${id}` : base;
}

/** Public SEO-friendly course path */
export function getCoursePath(course: {
  slug?: string | null;
  title: string;
  _id?: { toString(): string } | string;
}): string {
  return `/courses/${getCourseSlug(course)}`;
}

/** MongoDB filter: slug or ObjectId */
export function courseParamFilter(param: string): Record<string, unknown> {
  if (isObjectId(param)) return { _id: param };
  return { slug: param };
}
