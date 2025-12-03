import { type HTMLAttributes } from 'react';
import { cn } from '@/shared/lib/utils/cn';

interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'error' | 'success' | 'warning' | 'info';
}

export function Alert({ variant = 'info', className, children, ...props }: AlertProps) {
  return (
    <div
      role="alert"
      className={cn(
        'rounded-md border p-4',
        {
          'border-red-200 bg-red-50 text-red-900': variant === 'error',
          'border-green-200 bg-green-50 text-green-900': variant === 'success',
          'border-yellow-200 bg-yellow-50 text-yellow-900': variant === 'warning',
          'border-blue-200 bg-blue-50 text-blue-900': variant === 'info',
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
