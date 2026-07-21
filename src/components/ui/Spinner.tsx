import React from 'react';
import clsx from 'clsx';

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className }) => {
  return (
    <div
      className={clsx(
        'animate-spin rounded-full border-current border-t-transparent text-[#0D3B2E]',
        {
          'h-4 w-4 border-2': size === 'sm',
          'h-8 w-8 border-3': size === 'md',
          'h-12 w-12 border-4': size === 'lg',
        },
        className
      )}
    />
  );
};

export default Spinner;
