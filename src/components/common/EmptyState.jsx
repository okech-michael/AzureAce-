export default function EmptyState({ icon: Icon, title, body, action, className = '' }) {
  return (
    <div className={`rounded-2xl border border-dashed border-border bg-card/60 px-6 py-12 text-center ${className}`}>
      {Icon && (
        <span className="mx-auto grid h-11 w-11 place-items-center rounded-xl border border-border bg-background text-brand-azure">
          <Icon className="h-5 w-5" />
        </span>
      )}
      <h3 className="mt-4 font-heading text-[15px] font-semibold text-brand-ink">{title}</h3>
      {body && <p className="mx-auto mt-1.5 max-w-md text-[13px] leading-relaxed text-muted-foreground">{body}</p>}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}