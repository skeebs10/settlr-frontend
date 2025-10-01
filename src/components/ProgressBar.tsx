import React from 'react';

interface ProgressBarProps {
  current: number;
  total: number;
  className?: string;
}

export function ProgressBar({ current, total, className = '' }: ProgressBarProps) {
  const percentage = total > 0 ? Math.min((current / total) * 100, 100) : 0;
  
  return (
    <div className={`progress-bar ${className}`}>
      <div 
        className="progress-fill"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}