import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Types
export type Cents = number;
export type ClaimType = "FULL" | "HALF" | "CUSTOM_$" | "CUSTOM_%";
export type ItemStatus = "UNCLAIMED" | "PARTIAL" | "FULLY_CLAIMED";
export type PaymentStatus = "PENDING" | "PAID";
export type TabStatus = "OPEN" | "READY_TO_CLOSE" | "CLOSED";

export interface Claim {
  id: string;
  itemId: string;
  participantId: string;
  type: ClaimType;
  amount: Cents;
  createdAt: string;
}

export interface Item {
  id: string;
  name: string;
  price: Cents;
  claims: Claim[];
  claimedAmount: Cents;
  remainingAmount: Cents;
  status: ItemStatus;
}

export interface Participant {
  id: string;
  displayName: string;
  isHost: boolean;
  claimedTotal: Cents;
  paidTotal: Cents;
  owesToHost: Cents;
  status: PaymentStatus;
}

export interface Totals {
  itemsSubtotal: Cents;
  claimedSubtotal: Cents;
  unclaimedTotal: Cents;
  tax: Cents;
  tip: Cents;
  grandTotal: Cents;
  unpaidToHost: Cents;
}

export interface Tab {
  id: string;
  venueName: string;
  tableName?: string;
  status: TabStatus;
  items: Item[];
  participants: Participant[];
  hostId: string;
  totals: Totals;
  publicReceiptUrl: string;
  publicTabUrl: string;
  createdAt: string;
  updatedAt: string;
}

interface SettlrState {
  currentTab: Tab | null;
  currentUserId: string;
  tipAmount: Cents;
  
  // Actions
  setCurrentTab: (tab: Tab) => void;
  setCurrentUserId: (userId: string) => void;
  setTipAmount: (amount: Cents) => void;
  recomputeTab: () => void;
  
  // Getters
  getCurrentUser: () => Participant | null;
  getUserClaimedItems: () => Item[];
  getUserClaimedTotal: () => Cents;
}

// Helper functions
const recomputeItem = (item: Item): Item => {
  const claimedAmount = item.claims.reduce((sum, claim) => sum + claim.amount, 0);
  const remainingAmount = Math.max(0, item.price - claimedAmount);
  
  let status: ItemStatus = "UNCLAIMED";
  if (claimedAmount > 0 && remainingAmount > 0) {
    status = "PARTIAL";
  } else if (remainingAmount === 0) {
    status = "FULLY_CLAIMED";
  }
  
  return {
    ...item,
    claimedAmount,
    remainingAmount,
    status
  };
};

const recomputeParticipant = (participant: Participant, items: Item[]): Participant => {
  const claimedTotal = items.reduce((sum, item) => {
    const userClaims = item.claims.filter(claim => claim.participantId === participant.id);
    return sum + userClaims.reduce((claimSum, claim) => claimSum + claim.amount, 0);
  }, 0);
  
  const owesToHost = participant.isHost ? 0 : Math.max(0, claimedTotal - participant.paidTotal);
  
  return {
    ...participant,
    claimedTotal,
    owesToHost
  };
};

const recomputeTotals = (items: Item[], participants: Participant[], tip: Cents): Totals => {
  const itemsSubtotal = items.reduce((sum, item) => sum + item.price, 0);
  const claimedSubtotal = items.reduce((sum, item) => sum + item.claimedAmount, 0);
  const unclaimedTotal = itemsSubtotal - claimedSubtotal;
  const tax = Math.round(itemsSubtotal * 0.1); // 10% tax
  const grandTotal = itemsSubtotal + tax + tip;
  const unpaidToHost = participants.reduce((sum, p) => sum + p.owesToHost, 0);
  
  return {
    itemsSubtotal,
    claimedSubtotal,
    unclaimedTotal,
    tax,
    tip,
    grandTotal,
    unpaidToHost
  };
};

// Seed data
const createSeedData = (): Tab => {
  const hostId = "host-1";
  const alexId = "alex-1";
  const caseyId = "casey-1";
  
  const items: Item[] = [
    {
      id: "item-1",
      name: "Burger",
      price: 1500, // $15.00
      claims: [],
      claimedAmount: 0,
      remainingAmount: 1500,
      status: "UNCLAIMED"
    },
    {
      id: "item-2", 
      name: "Fries",
      price: 800, // $8.00
      claims: [],
      claimedAmount: 0,
      remainingAmount: 800,
      status: "UNCLAIMED"
    },
    {
      id: "item-3",
      name: "Drink",
      price: 500, // $5.00
      claims: [],
      claimedAmount: 0,
      remainingAmount: 500,
      status: "UNCLAIMED"
    }
  ];
  
  const participants: Participant[] = [
    {
      id: hostId,
      displayName: "Host",
      isHost: true,
      claimedTotal: 0,
      paidTotal: 0,
      owesToHost: 0,
      status: "PENDING"
    },
    {
      id: alexId,
      displayName: "Alex",
      isHost: false,
      claimedTotal: 0,
      paidTotal: 0,
      owesToHost: 0,
      status: "PENDING"
    },
    {
      id: caseyId,
      displayName: "Casey",
      isHost: false,
      claimedTotal: 0,
      paidTotal: 0,
      owesToHost: 0,
      status: "PENDING"
    }
  ];
  
  return {
    id: "tab-demo",
    venueName: "TAO",
    tableName: "Table 12",
    status: "OPEN",
    items,
    participants,
    hostId,
    totals: recomputeTotals(items, participants, 0),
    publicReceiptUrl: "https://app.settlr.com/r/tab-demo",
    publicTabUrl: "https://app.settlr.com/t/tab-demo",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
};

export const useSettlrStore = create<SettlrState>()(
  persist(
    (set, get) => ({
      currentTab: createSeedData(),
      currentUserId: "host-1",
      tipAmount: 0,
      
      setCurrentTab: (tab) => set({ currentTab: tab }),
      setCurrentUserId: (userId) => set({ currentUserId: userId }),
      setTipAmount: (amount) => {
        set({ tipAmount: amount });
        get().recomputeTab();
      },
      
      recomputeTab: () => {
        const state = get();
        if (!state.currentTab) return;
        
        // Recompute items
        const recomputedItems = state.currentTab.items.map(recomputeItem);
        
        // Recompute participants
        const recomputedParticipants = state.currentTab.participants.map(p => 
          recomputeParticipant(p, recomputedItems)
        );
        
        // Recompute totals
        const totals = recomputeTotals(recomputedItems, recomputedParticipants, state.tipAmount);
        
        // Update tab status
        let status = state.currentTab.status;
        if (totals.unclaimedTotal === 0 && totals.unpaidToHost === 0 && status === "OPEN") {
          status = "READY_TO_CLOSE";
        }
        
        set({
          currentTab: {
            ...state.currentTab,
            items: recomputedItems,
            participants: recomputedParticipants,
            totals,
            status,
            updatedAt: new Date().toISOString()
          }
        });
      },
      
      getCurrentUser: () => {
        const state = get();
        if (!state.currentTab) return null;
        return state.currentTab.participants.find(p => p.id === state.currentUserId) || null;
      },
      
      getUserClaimedItems: () => {
        const state = get();
        if (!state.currentTab) return [];
        return state.currentTab.items.filter(item => 
          item.claims.some(claim => claim.participantId === state.currentUserId)
        );
      },
      
      getUserClaimedTotal: () => {
        const state = get();
        const user = state.getCurrentUser();
        return user?.claimedTotal || 0;
      }
    }),
    {
      name: 'settlr-store',
      partialize: (state) => ({ 
        currentTab: state.currentTab,
        currentUserId: state.currentUserId,
        tipAmount: state.tipAmount
      }),
    }
  )
);