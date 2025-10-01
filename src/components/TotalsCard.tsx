import React from 'react';

interface TotalsCardProps {
  subtotal: number;
  tax: number;
  tip: number;
  total: number;
  className?: string;
}

export function TotalsCard({ subtotal, tax, tip, total, className = '' }: TotalsCardProps) {
  const formatCents = (cents: number) => `$${(cents / 100).toFixed(2)}`;
  
  return (
    <div className={`card-emphasis ${className}`}>
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-text-secondary">Subtotal:</span>
          <span className="font-medium text-text-primary">{formatCents(subtotal)}</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-text-secondary">Tax:</span>
          <span className="font-medium text-text-primary">{formatCents(tax)}</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-text-secondary">Tip:</span>
          <span className="font-medium text-text-primary">{formatCents(tip)}</span>
        </div>
        
        <div className="border-t border-divider"></div>
        
        <div className="flex justify-between text-lg font-semibold pt-2">
          <span className="text-text-primary">Total:</span>
          <span className="text-brand-primary">{formatCents(total)}</span>
        </div>
      </div>
    </div>
  );
}