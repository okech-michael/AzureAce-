export default function StatCard({ label, value, hint, icon: Icon, tone = 'default' }) {
  const toneClass =
    tone === 'azure' ? 'text-brand-azure' : tone === 'violet' ? 'text-brand-violet' : tone === 'mint' ? 'text-brand-mint' : 'text-brand-navy';

  return (
    <div className="aa-panel p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-medium uppercase tracking-[0.13em] text-muted-foreground">{label}</p>
        {Icon && <Icon className={`h-4 w-4 ${toneClass}`} />}
      </div>
      <p className="mt-2 font-heading text-[24px] font-semibold leading-none tracking-tight text-brand-ink">{value}</p>
      {hint && <p className="mt-1.5 text-[11.5px] leading-snug text-muted-foreground">{hint}</p>}
    </div>
  );
}