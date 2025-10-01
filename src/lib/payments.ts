// Payment integration layer
import { loadStripe, Stripe } from '@stripe/stripe-js';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export interface PaymentMethod {
  type: 'card' | 'apple_pay' | 'google_pay';
  last4?: string;
  brand?: string;
}

export interface PaymentResult {
  success: boolean;
  payment_intent_id?: string;
  error?: string;
}

export class PaymentService {
  private stripe: Stripe | null = null;

  async initialize() {
    this.stripe = await stripePromise;
    return this.stripe;
  }

  // Check if Apple Pay is available
  async isApplePayAvailable(): Promise<boolean> {
    if (!this.stripe) await this.initialize();
    
    const paymentRequest = this.stripe?.paymentRequest({
      country: 'US',
      currency: 'usd',
      total: { label: 'Test', amount: 100 },
    });

    return paymentRequest?.canMakePayment().then(result => 
      result?.applePay === true
    ) || false;
  }

  // Check if Google Pay is available
  async isGooglePayAvailable(): Promise<boolean> {
    if (!this.stripe) await this.initialize();
    
    const paymentRequest = this.stripe?.paymentRequest({
      country: 'US',
      currency: 'usd',
      total: { label: 'Test', amount: 100 },
    });

    return paymentRequest?.canMakePayment().then(result => 
      result?.googlePay === true
    ) || false;
  }

  // Process Apple Pay / Google Pay
  async processDigitalWallet(
    clientSecret: string, 
    amount: number, 
    venue: string
  ): Promise<PaymentResult> {
    if (!this.stripe) await this.initialize();

    const paymentRequest = this.stripe!.paymentRequest({
      country: 'US',
      currency: 'usd',
      total: {
        label: `${venue} - Settlr`,
        amount: amount,
      },
    });

    const { paymentMethod, error } = await paymentRequest.show();
    
    if (error) {
      return { success: false, error: error.message };
    }

    // Confirm payment with Stripe
    const { error: confirmError, paymentIntent } = await this.stripe!.confirmCardPayment(
      clientSecret,
      { payment_method: paymentMethod.id }
    );

    if (confirmError) {
      return { success: false, error: confirmError.message };
    }

    return { 
      success: true, 
      payment_intent_id: paymentIntent.id 
    };
  }

  // Process card payment
  async processCardPayment(
    clientSecret: string,
    cardElement: any
  ): Promise<PaymentResult> {
    if (!this.stripe) await this.initialize();

    const { error, paymentIntent } = await this.stripe!.confirmCardPayment(
      clientSecret,
      {
        payment_method: {
          card: cardElement,
        }
      }
    );

    if (error) {
      return { success: false, error: error.message };
    }

    return { 
      success: true, 
      payment_intent_id: paymentIntent.id 
    };
  }
}

export const paymentService = new PaymentService();