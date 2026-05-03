// Client-safe tag utilities (no DB, no fs imports)

export const TAG_COLORS = [
  { bg: 'rgba(0,117,202,0.12)',   border: 'rgba(0,117,202,0.4)',   text: '#0075ca' },
  { bg: 'rgba(14,138,22,0.12)',   border: 'rgba(14,138,22,0.4)',   text: '#0e8a16' },
  { bg: 'rgba(217,63,11,0.12)',   border: 'rgba(217,63,11,0.4)',   text: '#d93f0b' },
  { bg: 'rgba(83,25,231,0.12)',   border: 'rgba(83,25,231,0.4)',   text: '#5319e7' },
  { bg: 'rgba(199,160,1,0.15)',   border: 'rgba(199,160,1,0.5)',   text: '#a37c00' },
  { bg: 'rgba(224,37,90,0.10)',   border: 'rgba(224,37,90,0.35)',  text: '#e0255a' },
  { bg: 'rgba(0,107,117,0.12)',   border: 'rgba(0,107,117,0.4)',   text: '#006b75' },
  { bg: 'rgba(249,115,22,0.12)',  border: 'rgba(249,115,22,0.4)',  text: '#c2450e' },
] as const;

export type TagColor = typeof TAG_COLORS[number];

export function hashTagColor(str: string): number {
  let h = 0;
  for (const c of str) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h % TAG_COLORS.length;
}

export function slugifyTag(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function getTagColor(colorIndex: number): TagColor {
  return TAG_COLORS[colorIndex % TAG_COLORS.length] ?? TAG_COLORS[0];
}
