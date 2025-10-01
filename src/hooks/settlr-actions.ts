// Placeholder hooks for backend integration
import { useSettlrStore, ClaimType, Cents } from '../store/settlr-store';
import toast from 'react-hot-toast';

// Claims
export async function onClaimItem(
  itemId: string, 
  type: ClaimType, 
  payload?: { amount?: number; percent?: number }
): Promise<void> {
  const { currentTab, currentUserId, setCurrentTab, recomputeTab } = useSettlrStore.getState();
  
  if (!currentTab) throw new Error('No current tab');
  
  const item = currentTab.items.find(i => i.id === itemId);
  if (!item) throw new Error('Item not found');
  
  let claimAmount = 0;
  
  switch (type) {
    case "FULL":
      claimAmount = item.remainingAmount;
      break;
    case "HALF":
      claimAmount = Math.round(item.price * 0.5);
      claimAmount = Math.min(claimAmount, item.remainingAmount);
      break;
    case "CUSTOM_$":
      claimAmount = payload?.amount || 0;
      claimAmount = Math.min(claimAmount, item.remainingAmount);
      break;
    case "CUSTOM_%":
      const percent = payload?.percent || 0;
      claimAmount = Math.round(item.price * (percent / 100));
      claimAmount = Math.min(claimAmount, item.remainingAmount);
      break;
  }
  
  if (claimAmount <= 0) {
    throw new Error('Invalid claim amount');
  }
  
  // Remove existing claims for this user on this item
  const existingClaimIndex = item.claims.findIndex(c => c.participantId === currentUserId);
  if (existingClaimIndex >= 0) {
    item.claims.splice(existingClaimIndex, 1);
  }
  
  // Add new claim
  const newClaim = {
    id: `claim-${Date.now()}`,
    itemId,
    participantId: currentUserId,
    type,
    amount: claimAmount,
    createdAt: new Date().toISOString()
  };
  
  item.claims.push(newClaim);
  
  setCurrentTab({ ...currentTab });
  recomputeTab();
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const formatCents = (cents: number) => `$${(cents / 100).toFixed(2)}`;
  toast.success(`Claimed ${formatCents(claimAmount)} of ${item.name}`, {
    duration: 2500,
    style: {
      background: '#1A1A1D',
      color: '#FFFFFF',
      borderRadius: '12px',
    },
    iconTheme: {
      primary: '#009B3A',
      secondary: '#FFFFFF'
    }
  });
}

export async function onEditClaim(
  claimId: string, 
  payload: { amount?: number; percent?: number }
): Promise<void> {
  // TODO: Implement claim editing
  await new Promise(resolve => setTimeout(resolve, 100));
}

export async function onRemoveClaim(claimId: string): Promise<void> {
  const { currentTab, setCurrentTab, recomputeTab } = useSettlrStore.getState();
  
  if (!currentTab) throw new Error('No current tab');
  
  // Find and remove the claim
  for (const item of currentTab.items) {
    const claimIndex = item.claims.findIndex(c => c.id === claimId);
    if (claimIndex >= 0) {
      const claim = item.claims[claimIndex];
      item.claims.splice(claimIndex, 1);
      
      setCurrentTab({ ...currentTab });
      recomputeTab();
      
      const formatCents = (cents: number) => `$${(cents / 100).toFixed(2)}`;
      toast.success(`Removed ${formatCents(claim.amount)} claim from ${item.name}`, {
        duration: 2500,
        style: {
          background: '#1A1A1D',
          color: '#FFFFFF',
          borderRadius: '12px',
        },
        iconTheme: {
          primary: '#009B3A',
          secondary: '#FFFFFF'
        }
      });
      
      await new Promise(resolve => setTimeout(resolve, 100));
      return;
    }
  }
  
  throw new Error('Claim not found');
}

// Payments
export async function onPayRestaurant(
  payerId: string, 
  amount: Cents, 
  opts: { tip: Cents; tax: Cents }
): Promise<void> {
  const { currentTab, setCurrentTab, recomputeTab } = useSettlrStore.getState();
  
  if (!currentTab) throw new Error('No current tab');
  
  const participant = currentTab.participants.find(p => p.id === payerId);
  if (!participant) throw new Error('Participant not found');
  
  participant.paidTotal += amount;
  participant.status = "PAID";
  
  setCurrentTab({ ...currentTab });
  recomputeTab();
  
  // Simulate payment processing
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const formatCents = (cents: number) => `$${(cents / 100).toFixed(2)}`;
  toast.success(`Payment of ${formatCents(amount)} processed successfully`, {
    duration: 3000,
    style: {
      background: '#1A1A1D',
      color: '#FFFFFF',
      borderRadius: '12px',
    },
    iconTheme: {
      primary: '#009B3A',
      secondary: '#FFFFFF'
    }
  });
}

export async function onMarkReceived(
  fromParticipantId: string, 
  amount: Cents
): Promise<void> {
  const { currentTab, setCurrentTab, recomputeTab } = useSettlrStore.getState();
  
  if (!currentTab) throw new Error('No current tab');
  
  const participant = currentTab.participants.find(p => p.id === fromParticipantId);
  if (!participant) throw new Error('Participant not found');
  
  participant.paidTotal += amount;
  if (participant.owesToHost <= amount) {
    participant.status = "PAID";
  }
  
  setCurrentTab({ ...currentTab });
  recomputeTab();
  
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const formatCents = (cents: number) => `$${(cents / 100).toFixed(2)}`;
  toast.success(`Marked ${formatCents(amount)} received from ${participant.displayName}`, {
    duration: 2500,
    style: {
      background: '#1A1A1D',
      color: '#FFFFFF',
      borderRadius: '12px',
    },
    iconTheme: {
      primary: '#009B3A',
      secondary: '#FFFFFF'
    }
  });
}

// Close tab
export async function onCloseTab(): Promise<void> {
  const { currentTab, setCurrentTab } = useSettlrStore.getState();
  
  if (!currentTab) throw new Error('No current tab');
  
  if (currentTab.totals.unclaimedTotal > 0) {
    const formatCents = (cents: number) => `$${(cents / 100).toFixed(2)}`;
    throw new Error(`Cannot close: ${formatCents(currentTab.totals.unclaimedTotal)} unclaimed`);
  }
  
  if (currentTab.totals.unpaidToHost > 0) {
    const formatCents = (cents: number) => `$${(cents / 100).toFixed(2)}`;
    throw new Error(`Cannot close: ${formatCents(currentTab.totals.unpaidToHost)} unpaid`);
  }
  
  currentTab.status = "CLOSED";
  setCurrentTab({ ...currentTab });
  
  await new Promise(resolve => setTimeout(resolve, 500));
  
  toast.success('Tab closed successfully', {
    duration: 3000,
    style: {
      background: '#1A1A1D',
      color: '#FFFFFF',
      borderRadius: '12px',
    },
    iconTheme: {
      primary: '#009B3A',
      secondary: '#FFFFFF'
    }
  });
}

// Share
export function getPublicReceiptUrl(): string {
  const { currentTab } = useSettlrStore.getState();
  return currentTab?.publicReceiptUrl || '';
}

export function getPublicTabUrl(): string {
  const { currentTab } = useSettlrStore.getState();
  return currentTab?.publicTabUrl || '';
}

export async function onDownloadPDF(tabId: string): Promise<void> {
  // Simulate PDF generation
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Simulate success/failure
  if (Math.random() > 0.1) {
    toast.success('PDF ready', {
      duration: 2500,
      style: {
        background: '#1A1A1D',
        color: '#FFFFFF',
        borderRadius: '12px',
      },
      iconTheme: {
        primary: '#009B3A',
        secondary: '#FFFFFF'
      }
    });
  } else {
    throw new Error('PDF generation failed');
  }
}