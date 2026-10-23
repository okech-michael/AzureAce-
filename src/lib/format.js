export const DOMAINS = [
  { key: 'cloud-concepts', label: 'Cloud concepts', weight: '25–30%' },
  { key: 'architecture-services', label: 'Azure architecture and services', weight: '35–40%' },
  { key: 'management-governance', label: 'Azure management and governance', weight: '30–35%' },
];

export const DIFFICULTY_STYLES = {
  easy: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  medium: 'bg-amber-50 text-amber-700 border-amber-200',
  hard: 'bg-rose-50 text-rose-700 border-rose-200',
};

export function pct(value) {
  const n = Number(value);
  return Number.isFinite(n) ? `${Math.round(n)}%` : '—';
}

export function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

export function initials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'A';
}