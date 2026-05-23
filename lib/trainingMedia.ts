import {
    processThumbnailUrl,
    processPreviewVideoUrl,
    isDisallowedStockMediaUrl,
} from '@/lib/courseMedia';

/** Normalize media before saving to MongoDB */
export function processTrainingMediaForSave(data: {
    thumbnail?: string;
    previewVideoUrl?: string;
}): { thumbnail: string; previewVideoUrl: string } {
    return {
        thumbnail: processThumbnailUrl(data.thumbnail) ?? '',
        previewVideoUrl: processPreviewVideoUrl(data.previewVideoUrl) ?? '',
    };
}

/** Normalize media when reading from DB (fixes legacy raw Drive links) */
export function normalizeTrainingMedia<T extends Record<string, unknown>>(training: T): T {
    let thumb = training.thumbnail as string | undefined;
    let video = training.previewVideoUrl as string | undefined;
    if (isDisallowedStockMediaUrl(thumb)) thumb = '';
    if (isDisallowedStockMediaUrl(video)) video = '';

    return {
        ...training,
        thumbnail: thumb ? processThumbnailUrl(thumb) || thumb : '',
        previewVideoUrl: video ? processPreviewVideoUrl(video) || video : '',
    };
}

export function normalizeTrainingsList(trainings: Record<string, unknown>[]) {
    return trainings.map((t) => normalizeTrainingMedia(t));
}
