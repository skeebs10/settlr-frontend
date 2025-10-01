import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { paymentService } from '../lib/payments';
import { CreditCard, Smartphone, Wallet } from 'lucide-react';

interface PaymentMethodsProps {
  amount: number;
  venue: string;
  clientSecret: string;
  onPaymentSuccess: (paymentIntentId: string) => void;
  onPaymentError: (error: string) => void;
}

export function PaymentMethods({ 
  amount, 
  venue, 
  clientSecret, 
  onPaymentSuccess, 
  onPaymentError 
}: PaymentMethodsProps) {
  const [applePayAvailable, setApplePayAvailable] = useState(false);
  const [googlePayAvailable, setGooglePayAvailable] = useState(false);
  const [processing, setProcessing] = useState<string | null>(null);

  const formatCents = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  useEffect(() => {
    // Check available payment methods
    const checkPaymentMethods = async () => {
      const [applePay, googlePay] = await Promise.all([
        paymentService.isApplePayAvailable(),
        paymentService.isGooglePayAvailable()
      ]);
      
      setApplePayAvailable(applePay);
      setGooglePayAvailable(googlePay);
    };

    checkPaymentMethods();
  }, []);

  const handleDigitalWalletPayment = async (type: 'apple' | 'google') => {
    setProcessing(type);
    
    try {
      const result = await paymentService.processDigitalWallet(
        clientSecret,
        amount,
        venue
      );

      if (result.success && result.payment_intent_id) {
        onPaymentSuccess(result.payment_intent_id);
      } else {
        onPaymentError(result.error || 'Payment failed');
      }
    } catch (error) {
      onPaymentError('Payment failed');
    } finally {
      setProcessing(null);
    }
  };

  const handleCardPayment = () => {
    // This would open a card input modal/form
    // For now, just simulate card payment
    setProcessing('card');
    
    setTimeout(() => {
      // Use the actual client secret as the payment intent ID for mock
      const paymentIntentId = clientSecret.replace('_secret', '');
      onPaymentSuccess(paymentIntentId);
      setProcessing(null);
    }, 2000);
  };

  return (
    <div className="space-y-3">
      {/* Apple Pay */}
      {applePayAvailable && (
        <Button
          onClick={() => handleDigitalWalletPayment('apple')}
          loading={processing === 'apple'}
          className="w-full py-4 bg-black hover:bg-gray-800 text-white"
          size="lg"
        >
          <Smartphone className="w-5 h-5 mr-2" />
          Pay with Apple Pay - {formatCents(amount)}
        </Button>
      )}

      {/* Google Pay */}
      {googlePayAvailable && (
        <Button
          onClick={() => handleDigitalWalletPayment('google')}
          loading={processing === 'google'}
          className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white"
          size="lg"
        >
          <Wallet className="w-5 h-5 mr-2" />
          Pay with Google Pay - {formatCents(amount)}
        </Button>
      )}

      {/* Credit Card */}
      <Button
        onClick={handleCardPayment}
        loading={processing === 'card'}
        className="w-full py-4"
        size="lg"
      >
        Pay Now
      </Button>
    </div>
  );
}