import React from 'react';
import { Item } from '../store/settlr-store';
import { Check } from 'lucide-react';

interface StatusPillProps {
  item: Item;
}

export function StatusPill({ item }: StatusPillProps) {
  const getStatusText = () => {
    if (item.status === 'FULLY_CLAIMED') return 'Full';
    if (item.status === 'PARTIAL') {
      const percentage = Math.round((item.claimedAmount / item.price) * 100);
      if (percentage === 50) return 'Half';
      return `${percentage}%`;
    }
    return '';
  };
  
  if (item.status === 'UNCLAIMED') return null;
  
  return (
    <div className="status-pill flex items-center space-x-1">
      <Check className="w-3 h-3" />
      <span>{getStatusText()}</span>
    </div>
  );
}