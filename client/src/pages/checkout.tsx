import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`,
        },
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Payment error:", err);
      toast({
        title: "Payment Error",
        description: "An unexpected error occurred during payment processing",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white p-5 rounded-lg shadow-md border border-gray-200">
        <PaymentElement />
      </div>
      <Button 
        type="submit" 
        className="btn-primary w-full" 
        disabled={!stripe || isLoading}
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <i className="fas fa-spinner animate-spin mr-2"></i>
            Processing...
          </span>
        ) : (
          "Complete Payment"
        )}
      </Button>
    </form>
  );
};

export default function Checkout() {
  const [clientSecret, setClientSecret] = useState("");
  const { toast } = useToast();
  
  // Extract amount from URL query parameters
  const getAmountFromUrl = () => {
    if (typeof window === 'undefined') return 10;
    const urlParams = new URLSearchParams(window.location.search);
    const amount = Number(urlParams.get('amount'));
    return isNaN(amount) || amount < 1 ? 10 : amount;
  };

  useEffect(() => {
    // Create PaymentIntent as soon as the page loads
    const fetchPaymentIntent = async () => {
      try {
        const amount = getAmountFromUrl();
        const response = await apiRequest("POST", "/api/create-payment-intent", { 
          amount: amount,
          description: "Rage Bet deposit"
        });
        
        if (!response.ok) {
          throw new Error("Failed to create payment intent");
        }
        
        const data = await response.json();
        setClientSecret(data.clientSecret);
      } catch (error) {
        console.error("Error creating payment intent:", error);
        toast({
          title: "Error",
          description: "Could not initialize payment. Please try again later.",
          variant: "destructive",
        });
      }
    };
    
    fetchPaymentIntent();
  }, [toast]);

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
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Secure Checkout</h1>
            <p className="text-gray-600">Complete your payment for Rage Bet</p>
          </div>
          
          {!clientSecret ? (
            <div className="flex justify-center">
              <div className="animate-spin w-12 h-12 border-4 border-accent border-t-transparent rounded-full" aria-label="Loading"/>
            </div>
          ) : (
            <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
              <CheckoutForm />
            </Elements>
          )}
        </div>
      </main>
    </div>
  );
}