export default function Badge({ children, tone = 'neutral', className = '' }) {
  const tones = {
    neutral: 'bg-secondary text-muted-foreground border-transparent',
    azure: 'bg-brand-mist text-brand-azure border-brand-azure/15',
    mint: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    rose: 'bg-rose-50 text-rose-700 border-rose-200',
    violet: 'bg-violet-50 text-violet-700 border-violet-200',
    ink: 'bg-brand-ink text-white border-transparent',
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10.5px] font-medium ${tones[tone] || tones.neutral} ${className}`}
    >
      {children}
    </span>
  );
}