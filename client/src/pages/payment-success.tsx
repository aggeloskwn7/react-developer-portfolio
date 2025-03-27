import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";

interface PaymentData {
  status: string;
  amount?: number;
  currency?: string;
}

export default function PaymentSuccess() {
  const [paymentStatus, setPaymentStatus] = useState<{
    status: 'loading' | 'success' | 'error';
    message?: string;
    paymentData?: PaymentData;
  }>({ status: 'loading' });
  const [, setLocation] = useLocation();

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Get the payment_intent and payment_intent_client_secret from URL
        const urlParams = new URLSearchParams(window.location.search);
        const paymentIntentId = urlParams.get('payment_intent');
        
        if (!paymentIntentId) {
          setPaymentStatus({ 
            status: 'error', 
            message: 'No payment information found' 
          });
          return;
        }

        // Verify the payment status on the server
        const response = await apiRequest(
          'GET', 
          `/api/payment-status?payment_intent=${paymentIntentId}`
        );
        
        if (!response.ok) {
          throw new Error('Failed to verify payment');
        }
        
        const data = await response.json();
        
        if (data.status === 'succeeded') {
          setPaymentStatus({ 
            status: 'success',
            message: 'Your payment was successful! Your account has been credited.',
            paymentData: data
          });
        } else {
          setPaymentStatus({ 
            status: 'error',
            message: `Payment status: ${data.status}. Please contact support if you need assistance.`,
            paymentData: data
          });
        }
      } catch (error) {
        console.error('Error verifying payment:', error);
        setPaymentStatus({ 
          status: 'error',
          message: 'There was a problem verifying your payment'
        });
      }
    };

    verifyPayment();
  }, []);

  const formatAmount = (amount?: number, currency?: string) => {
    if (!amount) return '';
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getContent = () => {
    switch (paymentStatus.status) {
      case 'loading':
        return (
          <div className="flex justify-center">
            <div className="animate-spin w-12 h-12 border-4 border-accent border-t-transparent rounded-full" aria-label="Loading"/>
          </div>
        );
      
      case 'success':
        const { paymentData } = paymentStatus;
        const formattedAmount = formatAmount(paymentData?.amount, paymentData?.currency);
        
        return (
          <div className="text-center">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-check text-3xl"></i>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Payment Successful!</h2>
            
            {formattedAmount && (
              <div className="text-2xl font-bold text-accent mb-4">
                Amount: {formattedAmount}
              </div>
            )}
            
            <p className="text-gray-600 mb-8">{paymentStatus.message}</p>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <Button 
                onClick={() => window.location.href = "https://ragebet.replit.app"}
                className="btn-primary"
              >
                Go to Rage Bet
              </Button>
              <Button 
                onClick={() => setLocation('/')}
                variant="outline"
                className="border-accent text-accent hover:bg-accent-100"
              >
                Return to Portfolio
              </Button>
            </div>
          </div>
        );
      
      case 'error':
        return (
          <div className="text-center">
            <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-times text-3xl"></i>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Payment Issue</h2>
            <p className="text-gray-600 mb-8">{paymentStatus.message}</p>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <Button 
                onClick={() => setLocation('/checkout')}
                className="btn-primary"
              >
                Try Again
              </Button>
              <Button 
                onClick={() => setLocation('/')}
                variant="outline"
                className="border-accent text-accent hover:bg-accent-100"
              >
                Return to Portfolio
              </Button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 py-4">
        <div className="max-w-5xl mx-auto px-6">
          <a href="/" className="text-2xl font-bold text-accent flex items-center">
            <span className="mr-2">←</span> Return to Portfolio
          </a>
        </div>
      </header>
      
      <main className="flex-grow flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-xl p-8 shadow-md">
          {getContent()}
        </div>
      </main>
    </div>
  );
}