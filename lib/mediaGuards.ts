/** Reject ephemeral or invalid media URLs before persisting */
export function isPersistableMediaUrl(url?: string | null): boolean {
  if (!url || typeof url !== 'string') return false;
  const t = url.trim();
  if (!t) return false;
  if (t.startsWith('blob:')) return false;
  if (t.startsWith('data:') && t.length > 500_000) return false;
  return true;
}
