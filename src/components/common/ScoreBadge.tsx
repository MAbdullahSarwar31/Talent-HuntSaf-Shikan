import React from 'react';
import type { ScoreBand } from '../../types';
import { getScoreBandColor } from '../../utils/formatters';
import clsx from 'clsx';

interface ScoreBadgeProps {
  score: number;
  band: ScoreBand;
  size?: 'sm' | 'md' | 'lg';
  showScore?: boolean;
}

export const ScoreBadge: React.FC<ScoreBadgeProps> = ({
  score,
  band,
  size = 'md',
  showScore = true,
}) => {
  const colors = getScoreBandColor(band);

  const sizeClasses = {
    sm: 'px-2.5 py-0.5 text-[11px] gap-1',
    md: 'px-3 py-1 text-xs gap-1.5 font-bold',
    lg: 'px-3.5 py-1.5 text-sm gap-2 font-black',
  };

  const dotSizes = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full border transition-all select-none whitespace-nowrap shadow-sm',
        colors.bg,
        colors.text,
        colors.border,
        sizeClasses[size]
      )}
    >
      <span className={clsx('rounded-full flex-shrink-0', colors.dot, dotSizes[size])} />
      <span className="uppercase tracking-wider">
        {band} {showScore && `(${score})`}
      </span>
    </span>
  );
};
