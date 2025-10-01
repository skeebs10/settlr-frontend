import React from 'react';

export function TabCardSkeleton() {
  return (
    <div className="card-default">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="h-5 bg-[#2A2F35] rounded w-3/4 mb-1"></div>
        </div>
        <div className="h-6 bg-[#2A2F35] rounded-full w-16 ml-3"></div>
      </div>
      
      {/* Chips Row */}
      <div className="flex items-center gap-4 mb-3">
        <div className="h-4 bg-[#2A2F35] rounded w-16"></div>
        <div className="h-4 bg-[#2A2F35] rounded w-20"></div>
        <div className="h-4 bg-[#2A2F35] rounded w-18"></div>
      </div>
      
      {/* Progress Bar */}
      <div className="mb-4">
        <div className="h-2 bg-[#2A2F35] rounded-full w-full"></div>
      </div>
      
      {/* Button */}
      <div className="flex justify-end">
        <div className="h-8 bg-[#2A2F35] rounded w-24"></div>
      </div>
    </div>
  );
}