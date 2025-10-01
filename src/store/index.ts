import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Check, Session, LineItem } from '../types';

interface AppState {
  session: Session | null;
  currentCheck: Check | null;
  tipAmount: number;
  paymentIntent: any;
  
  setSession: (session: Session) => void;
  setCurrentCheck: (check: Check) => void;
  setTipAmount: (amount: number) => void;
  setPaymentIntent: (intent: any) => void;
  updateItemClaim: (itemId: string, fraction: number) => void;
  clearSession: () => void;
  
  getMyClaimedItems: () => LineItem[];
  getMyTotal: () => number;
  getMySubtotal: () => number;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      session: null,
      currentCheck: null,
      tipAmount: 0,
      paymentIntent: null,

      setSession: (session) => {
        set({ session });
      },
      
      setCurrentCheck: (check) => {
        set({ currentCheck: check });
      },
      
      setTipAmount: (amount) => set({ tipAmount: amount }),
      
      setPaymentIntent: (intent) => set({ paymentIntent: intent }),
      
      updateItemClaim: (itemId, fraction) => {
        console.log('Store: updateItemClaim called with:', { itemId, fraction });
        const state = get();
        if (state.currentCheck) {
          console.log('Store: Updating item in currentCheck');
          const updatedItems = state.currentCheck.items.map(item =>
            item.line_item_id === itemId ? { ...item, claimed_fraction: fraction } : item
          );
          const updatedCheck = { ...state.currentCheck, items: updatedItems };
          console.log('Store: Setting updated check');
          set({ currentCheck: updatedCheck });
          console.log('Store: Check updated successfully');
        }
      },
      
      clearSession: () => {
        set({ 
          session: null, 
          currentCheck: null, 
          tipAmount: 0, 
          paymentIntent: null 
        });
        localStorage.removeItem('settlr-storage');
      },
      
      getMyClaimedItems: () => {
        const state = get();
        const claimedItems = state.currentCheck?.items.filter(item => item.claimed_fraction > 0) || [];
        console.log('Store: getMyClaimedItems returning:', claimedItems.length, 'items');
        return claimedItems;
      },
      
      getMySubtotal: () => {
        const state = get();
        const claimedItems = state.getMyClaimedItems();
        return claimedItems.reduce((sum, item) => 
          sum + (item.price_cents * item.claimed_fraction), 0);
      },
      
      getMyTotal: () => {
        const state = get();
        const subtotal = state.getMySubtotal();
        const taxRate = state.currentCheck ? 
          state.currentCheck.totals.tax_cents / state.currentCheck.totals.subtotal_cents : 0;
        const tax = Math.round(subtotal * taxRate);
        return subtotal + tax + state.tipAmount;
      }
    }),
    {
      name: 'settlr-storage',
      partialize: (state) => ({ 
        session: state.session, 
        currentCheck: state.currentCheck,
        tipAmount: state.tipAmount 
      }),
    }
  )
);