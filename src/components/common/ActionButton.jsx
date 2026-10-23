import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

const VARIANTS = {
  primary: 'bg-brand-ink text-white hover:bg-brand-navy shadow-[0_8px_20px_-14px_hsl(222_47%_9%/0.9)]',
  azure: 'bg-brand-azure text-white hover:bg-brand-ink shadow-[0_10px_26px_-14px_hsl(202_89%_40%/0.9)]',
  outline: 'border border-border bg-card text-brand-navy hover:border-brand-azure/50 hover:text-brand-azure',
  ghost: 'text-muted-foreground hover:bg-secondary hover:text-brand-ink',
  subtle: 'bg-secondary text-brand-navy hover:bg-border',
  danger: 'border border-destructive/30 bg-destructive/5 text-destructive hover:bg-destructive/10',
};

const SIZES = {
  sm: 'h-8 px-3 text-[12px] gap-1.5 rounded-lg',
  md: 'h-10 px-4 text-[13px] gap-2 rounded-xl',
  lg: 'h-12 px-6 text-[14px] gap-2 rounded-xl',
  icon: 'h-9 w-9 rounded-xl justify-center',
};

const ActionButton = forwardRef(function ActionButton(
  { as: Component = 'button', variant = 'primary', size = 'md', className, disabled, ...props },
  ref
) {
  return (
    <Component
      ref={ref}
      disabled={Component === 'button' ? disabled : undefined}
      aria-disabled={disabled || undefined}
      className={cn(
        'inline-flex select-none items-center justify-center font-medium transition-colors',
        'disabled:pointer-events-none disabled:opacity-50',
        VARIANTS[variant] || VARIANTS.primary,
        SIZES[size] || SIZES.md,
        className
      )}
      {...props}
    />
  );
});

export default ActionButton;