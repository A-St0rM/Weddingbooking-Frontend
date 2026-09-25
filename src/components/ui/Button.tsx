import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';
import { Spinner } from '@/components/ui/Spinner';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'md' | 'sm';

const variants: Record<Variant, string> = {
  primary: 'bg-primary text-on-primary hover:bg-primary-hover',
  secondary: 'bg-surface text-ink border border-control hover:bg-neutral-soft',
  ghost: 'text-ink hover:bg-neutral-soft',
  danger: 'bg-danger-solid text-white hover:bg-danger',
};

// Both sizes clear the 44px touch target; md is the default for a phone in one hand.
const sizes: Record<Size, string> = {
  md: 'min-h-12 px-5 text-base',
  sm: 'min-h-11 px-4 text-sm',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading = false, disabled, className, children, type = 'button', ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        'inline-flex cursor-pointer items-center justify-center gap-2 rounded-control font-medium',
        'transition-[background-color,transform] duration-150 ease-out active:scale-[0.98]',
        'disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
});
