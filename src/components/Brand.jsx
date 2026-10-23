export default function Brand({ tone = 'dark', className = '', markOnly = false }) {
  const wordColor = tone === 'light' ? 'text-white' : 'text-brand-ink';
  const accent = tone === 'light' ? 'text-brand-cyan' : 'text-brand-azure';

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <span className="relative grid h-9 w-9 place-items-center overflow-hidden rounded-[11px] bg-brand-ink">
        <span className="absolute inset-0 bg-gradient-to-br from-brand-cyan/40 via-transparent to-brand-violet/40" />
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="relative">
          <path d="M12 3.2 20 8.4v7.2L12 20.8 4 15.6V8.4L12 3.2Z" stroke="hsl(189 94% 65%)" strokeWidth="1.35" strokeLinejoin="round" />
          <path d="M12 8.6 15.6 11v3.4L12 16.6 8.4 14.4V11L12 8.6Z" fill="hsl(0 0% 100% / 0.94)" />
        </svg>
      </span>
      {!markOnly && (
        <span className={`font-heading text-[17px] font-semibold tracking-[-0.03em] ${wordColor}`}>
          Azure<span className={accent}>Ace</span>
        </span>
      )}
    </span>
  );
}