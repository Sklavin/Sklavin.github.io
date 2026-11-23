const SKIP = new Set(['a', 'an', 'and', 'the', 'of', 'or', 'to', 'in', 'on', 'for']);

export function initials(title: string): string {
  const words = title
    .replace(/[^\p{L}\p{N}\s']/gu, ' ')
    .split(/\s+/)
    .filter(Boolean);

  if (!words.length) return '—';

  const meaningful = words.filter((word) => !SKIP.has(word.toLowerCase()));
  const picked = (meaningful.length ? meaningful : words).slice(0, 2);

  if (picked.length === 1) return [...picked[0]].slice(0, 2).join('').toUpperCase();
  return picked.map((word) => [...word][0]).join('').toUpperCase();
}
