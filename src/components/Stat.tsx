import React from 'react';

interface StatProps {
  label: string;
  value: string | number;
  subtitle?: string;
  variant?: 'default' | 'house-a' | 'house-b' | 'accent';
  valueClassName?: string;
}

export const Stat: React.FC<StatProps> = ({
  label,
  value,
  subtitle,
  variant = 'default',
  valueClassName = '',
}) => {
  const borderColors = {
    default: '',
    'house-a': 'border-l-4 border-house-a',
    'house-b': 'border-l-4 border-house-b',
    accent: 'border-l-4 border-accent',
  };

  return (
    <div
      className={`bg-surface border border-line rounded-md p-5 ${borderColors[variant]}`}
    >
      <div className="text-[11px] tracking-wider uppercase text-ink-mute mb-2 font-mono">
        {label}
      </div>
      <div className={`font-serif text-3xl font-medium ${valueClassName}`}>
        {value}
      </div>
      {subtitle && <div className="text-sm text-ink-soft mt-1.5">{subtitle}</div>}
    </div>
  );
};
