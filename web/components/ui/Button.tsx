import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', isLoading, className = '', children, disabled, ...props }, ref) => {
    const base =
      'w-full rounded-button py-3.5 font-semibold text-base transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
    const variants = {
      primary: 'bg-bloom-500 text-white hover:bg-bloom-600',
      secondary: 'bg-white text-bloom-500 border-2 border-bloom-500 hover:bg-bloom-50',
    };

    return (
      <button
        ref={ref}
        className={`${base} ${variants[variant]} ${className}`}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? 'Please wait…' : children}
      </button>
    );
  },
);
Button.displayName = 'Button';
