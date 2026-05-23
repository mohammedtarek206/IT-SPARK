import { BRAND } from './config';

/** Branded alt text for images */
export function brandImageAlt(context: string): string {
  return `${BRAND.name} — ${context}`;
}

export function courseImageAlt(title: string): string {
  return `${BRAND.name} course: ${title}`;
}
