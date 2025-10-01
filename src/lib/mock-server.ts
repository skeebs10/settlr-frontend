// Store claims in memory to persist across calls
const claimsStore: { [key: string]: { [itemId: string]: number } } = {};

// Mock server implementation for development
export const MockServer = {
  joinSession: async (token: string, name?: string) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const session = {
      session_id: 'session_123',
      role: 'guest' as const,
      check_id: 'check_456',
      share_link: 'https://example.com/share/check_456',
      name: name || 'Demo User',
      is_host: true
    };
    
    return session;
  },

  getCheck: async (checkId: string) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // Get stored claims for this check
    const checkClaims = claimsStore[checkId] || {};
    
    console.log('MockServer: getCheck returning claims', { checkId, checkClaims });
    
    return {
      check_id: 'check_456',
      venue: 'TAO',
      created_at: new Date().toISOString(),
      status: 'active',
      totals: {
        subtotal_cents: 7500,
        tax_cents: 750,
        tip_cents: 1500,
        total_cents: 9750
      },
      items: [
        {
          line_item_id: 'item_1',
          name: 'Burger',
          price_cents: 1500,
          qty: 1,
          claimed_fraction: checkClaims['item_1'] || 0
        },
        {
          line_item_id: 'item_2',
          name: 'Fries',
          price_cents: 800,
          qty: 1,
          claimed_fraction: checkClaims['item_2'] || 0
        },
        {
          line_item_id: 'item_3',
          name: 'Drink',
          price_cents: 500,
          qty: 1,
          claimed_fraction: checkClaims['item_3'] || 0
        }
      ],
      participants: [
        {
          user_id: 'user_1',
          name: 'Demo User',
          status: 'active'
        }
      ]
    };
  },

  updateClaim: async (checkId: string, itemId: string, userId: string, fraction: number) => {
    console.log('MockServer: updateClaim called with:', { checkId, itemId, userId, fraction });
    
    try {
      // Very short delay to simulate API
      await new Promise(resolve => setTimeout(resolve, 10));
      
      // Store the claim
      if (!claimsStore[checkId]) {
        claimsStore[checkId] = {};
      }
      claimsStore[checkId][itemId] = fraction;
      
      console.log('MockServer: Claim stored successfully, returning success');
      return {
        success: true,
        claim: {
          user_id: userId,
          line_item_id: itemId,
          fraction: fraction
        }
      };
    } catch (error) {
      console.error('MockServer: Error in updateClaim:', error);
      throw error;
    }
  },

  processPayment: async (checkId: string, userId: string, paymentData: any) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      success: true,
      payment_id: 'payment_789',
      amount_cents: paymentData.amount_cents
    };
  },

  createPaymentIntent: async (checkId: string, tipCents: number) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return {
      client_secret: `pi_${Date.now()}_secret_${Math.random().toString(36).substr(2, 9)}`,
      payment_intent_id: `pi_${Date.now()}`,
      amount_cents: tipCents,
      tip_cents: tipCents
    };
  },

  confirmPayment: async (paymentIntentId: string) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      success: true,
      payment_intent_id: paymentIntentId,
      status: 'succeeded'
    };
  },

  getStaffChecks: async () => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 600));
    
    return {
      checks: [
        {
          check_id: 'check_456',
          venue: 'TAO',
          created_at: new Date().toISOString(),
          status: 'active',
          total_cents: 8550,
          participant_count: 3
        }
      ]
    };
  }
};