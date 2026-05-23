import { processThumbnailUrl, processPreviewVideoUrl } from '@/lib/courseMedia';
import { isPersistableMediaUrl } from '@/lib/mediaGuards';

const ALLOWED_FIELDS = [
  'title',
  'shortDescription',
  'description',
  'whatYouWillLearn',
  'requirements',
  'targetAudience',
  'level',
  'language',
  'category',
  'hours',
  'lecturesCount',
  'durationText',
  'type',
  'price',
  'isFree',
  'discountPrice',
  'passingGrade',
  'isActive',
  'status',
  'isFeatured',
] as const;

export function buildInstructorCourseUpdate(
  body: Record<string, unknown>
): Record<string, unknown> {
  const out: Record<string, unknown> = {};

  for (const key of ALLOWED_FIELDS) {
    if (body[key] !== undefined) out[key] = body[key];
  }

  if (body.thumbnail !== undefined || body.thumbnailLink !== undefined) {
    const raw = String(body.thumbnail ?? body.thumbnailLink ?? '').trim();
    if (!raw) out.thumbnail = null;
    else if (isPersistableMediaUrl(raw)) {
      out.thumbnail = processThumbnailUrl(raw) ?? null;
    }
  }

  if (body.previewVideoUrl !== undefined || body.videoLink !== undefined) {
    const raw = String(body.previewVideoUrl ?? body.videoLink ?? '').trim();
    if (!raw) out.previewVideoUrl = null;
    else if (isPersistableMediaUrl(raw)) {
      out.previewVideoUrl = processPreviewVideoUrl(raw) ?? null;
    }
  }

  return out;
}
