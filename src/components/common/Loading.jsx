export function LoadingBlock({ rows = 3, className = '' }) {
  return (
    <div className={`space-y-3 ${className}`} aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading</span>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-16 animate-pulse rounded-2xl border border-border bg-card/70" />
      ))}
    </div>
  );
}

export default function Loading() {
  return (
    <div className="flex items-center justify-center py-24">
      <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-border border-t-brand-azure" />
    </div>
  );
}