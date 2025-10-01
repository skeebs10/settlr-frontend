import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MockTab } from '../hooks/useMockTabs';
import { ProgressBar } from './ProgressBar';

interface TabCardProps {
  tab: MockTab;
  claimedPercentage: number;
}

export function TabCard({ tab, claimedPercentage }: TabCardProps) {
  const navigate = useNavigate();
  
  const formatCents = (cents: number) => `$${(cents / 100).toFixed(2)}`;
  
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'OPEN':
        return { 
          bg: 'bg-[#009B3A]/10', 
          text: 'text-[#009B3A]', 
          border: 'border-[#009B3A]/30',
          label: 'Open' 
        };
      case 'PARTIALLY_PAID':
        return { 
          bg: 'bg-[#FFB74D]/10', 
          text: 'text-[#FFB74D]', 
          border: 'border-[#FFB74D]/30',
          label: 'Partially Paid' 
        };
      case 'CLOSED':
        return { 
          bg: 'bg-[#8D949B]/10', 
          text: 'text-[#8D949B]', 
          border: 'border-[#8D949B]/30',
          label: 'Closed' 
        };
      default:
        return { 
          bg: 'bg-[#8D949B]/10', 
          text: 'text-[#8D949B]', 
          border: 'border-[#8D949B]/30',
          label: 'Unknown' 
        };
    }
  };
  
  const statusConfig = getStatusConfig(tab.status);
  
  const handleClick = () => {
    navigate(`/staff/tab/${tab.id}`);
  };
  
  return (
    <button
      onClick={handleClick}
      className="card-default card-hover tap-feedback w-full text-left transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-[rgba(0,155,58,0.25)]"
      aria-label={`Open ${tab.venueName} — ${tab.tableName}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-white mb-1 label truncate">
            {tab.venueName} — {tab.tableName}
          </h3>
        </div>
        
        <div className={`px-2 py-1 text-xs font-medium rounded-full border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border} flex-shrink-0 ml-3`}>
          {statusConfig.label}
        </div>
      </div>
      
      {/* Chips Row */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <div className="flex items-center space-x-1">
          <span className="text-xs text-[#B6BCC2]">Total:</span>
          <span className="text-sm font-medium text-white">{formatCents(tab.itemsSubtotal)}</span>
        </div>
        
        <div className="flex items-center space-x-1">
          <span className="text-xs text-[#B6BCC2]">Claimed:</span>
          <span className="text-sm font-medium text-white">{claimedPercentage}%</span>
        </div>
        
        {tab.unpaidToHost > 0 && (
          <div className="flex items-center space-x-1">
            <span className="text-xs text-[#FFB74D]">Unpaid:</span>
            <span className="text-sm font-medium text-[#FFB74D]">{formatCents(tab.unpaidToHost)}</span>
          </div>
        )}
      </div>
      
      {/* Progress Bar */}
      <div className="mb-4">
        <ProgressBar current={tab.claimedSubtotal} total={tab.itemsSubtotal} />
      </div>
      
      {/* View Details Button */}
      <div className="flex justify-end">
        <span className="btn-outlined px-4 py-2 text-sm font-medium">
          View Details
        </span>
      </div>
    </button>
  );
}