'use client';
import { cn } from '@/lib/utils';
import { type ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, children, ...props }, ref) => {
    const base =
      'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none';

    const variants = {
      primary:
        'bg-[#1B8C4E] text-white hover:bg-[#146B3A] active:scale-[0.98] focus-visible:ring-[#1B8C4E]',
      secondary:
        'bg-[#1A1A2E] text-white hover:bg-[#2a2a4e] active:scale-[0.98] focus-visible:ring-[#1A1A2E]',
      outline:
        'border-2 border-[#1B8C4E] text-[#1B8C4E] bg-transparent hover:bg-[#E8F5EE] active:scale-[0.98] focus-visible:ring-[#1B8C4E]',
      ghost:
        'bg-transparent text-[#1A1A2E] hover:bg-gray-100 active:scale-[0.98] focus-visible:ring-gray-400',
      danger:
        'bg-red-600 text-white hover:bg-red-700 active:scale-[0.98] focus-visible:ring-red-600',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-5 py-2.5 text-sm',
      lg: 'px-7 py-3.5 text-base',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      >
        {loading && (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
            <path
              fill="currentColor"
              className="opacity-75"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  },
);
Button.displayName = 'Button';
export default Button;
