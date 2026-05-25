import React, { ReactNode } from 'react';

interface CardProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  children,
  className = '',
}) => {
  return (
    <div
      className={`bg-surface border border-line rounded-md p-6 mb-5 shadow-sm ${className}`}
    >
      {(title || subtitle) && (
        <div className="flex justify-between items-baseline mb-4">
          {title && (
            <h2 className="font-serif text-2xl font-medium">{title}</h2>
          )}
          {subtitle && <span className="text-sm text-ink-mute italic">{subtitle}</span>}
        </div>
      )}
      {children}
    </div>
  );
};
