import React, { useState } from 'react';
import { Item } from '../store/settlr-store';
import { ClaimPills } from './ClaimPills';
import { StatusPill } from './StatusPill';
import { ProgressBar } from './ProgressBar';

interface ItemCardProps {
  item: Item;
  currentUserId: string;
}

export function ItemCard({ item, currentUserId }: ItemCardProps) {
  const [showClaimControls, setShowClaimControls] = useState(false);
  
  const formatCents = (cents: number) => `$${(cents / 100).toFixed(2)}`;
  
  const userClaim = item.claims.find(claim => claim.participantId === currentUserId);
  const isClaimed = !!userClaim;
  
  const handleClaimClick = () => {
    if (!isClaimed) {
      setShowClaimControls(true);
    }
  };
  
  return (
    <div className={`card-default transition-all duration-200 ${isClaimed ? 'claimed-border' : ''}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-text-primary mb-1">{item.name}</h3>
          
          {/* User's share info */}
          {userClaim && (
            <div className="space-y-1">
              <p className="text-sm text-brand-primary font-medium">
                Your share: {formatCents(userClaim.amount)}
              </p>
              {item.remainingAmount > 0 && (
                <p className="text-sm text-text-muted">
                  Remaining: {formatCents(item.remainingAmount)}
                </p>
              )}
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-3 ml-4">
          <span className="text-lg font-semibold text-text-primary">
            {formatCents(item.price)}
          </span>
          
          {isClaimed && <StatusPill item={item} />}
        </div>
      </div>
      
      {/* Progress bar for claimed items */}
      {item.claimedAmount > 0 && (
        <div className="mb-4">
          <ProgressBar current={item.claimedAmount} total={item.price} />
        </div>
      )}
      
      {/* Claim controls */}
      {showClaimControls ? (
        <ClaimPills 
          item={item} 
          currentUserId={currentUserId}
          onComplete={() => setShowClaimControls(false)}
        />
      ) : !isClaimed ? (
        <button
          onClick={handleClaimClick}
          className="btn-outlined w-full py-3 font-medium tap-feedback focus-ring"
        >
          + Claim
        </button>
      ) : (
        <ClaimPills 
          item={item} 
          currentUserId={currentUserId}
          onComplete={() => setShowClaimControls(false)}
        />
      )}
    </div>
  );
}