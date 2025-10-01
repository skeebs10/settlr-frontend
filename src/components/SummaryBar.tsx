import React from 'react';
import { useSettlrStore } from '../store/settlr-store';

export function SummaryBar() {
  const { currentTab } = useSettlrStore();
  
  if (!currentTab) return null;
  
  const formatCents = (cents: number) => `$${(cents / 100).toFixed(2)}`;
  
  const fullyClaimed = currentTab.items.filter(item => item.status === "FULLY_CLAIMED").length;
  const totalItems = currentTab.items.length;
  
  return (
    <div className="bg-card-default border-b border-divider sticky top-0 z-10">
      <div className="container-settlr py-3">
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <span className="text-text-secondary">Claims:</span>
            <span className="text-text-primary font-medium">
              {fullyClaimed}/{totalItems}
            </span>
          </div>
          
          {currentTab.totals.unclaimedTotal > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-text-secondary">Unclaimed:</span>
              <span className="text-yellow-400 font-medium">
                {formatCents(currentTab.totals.unclaimedTotal)}
              </span>
            </div>
          )}
          
          {currentTab.totals.unpaidToHost > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-text-secondary">Unpaid:</span>
              <span className="text-red-400 font-medium">
                {formatCents(currentTab.totals.unpaidToHost)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}