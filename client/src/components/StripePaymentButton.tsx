import { useState } from 'react';
import { Button } from "@/components/ui/button";

interface StripePaymentButtonProps {
  amount?: number;
  label?: string;
  className?: string;
}

export function StripePaymentButton({ 
  amount = 10, 
  label = "Deposit Funds", 
  className = ""
}: StripePaymentButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  const handlePayment = () => {
    setIsLoading(true);
    // Redirect to checkout page with amount
    window.location.href = `/checkout?amount=${amount}`;
  };
  
  return (
    <Button 
      onClick={handlePayment}
      className={`bg-accent hover:bg-accent/90 text-white ${className}`}
      disabled={isLoading}
    >
      {isLoading ? (
        <span className="flex items-center justify-center">
          <i className="fas fa-spinner animate-spin mr-2"></i>
          Loading...
        </span>
      ) : (
        <>
          <i className="fas fa-credit-card mr-2"></i>
          {label}
        </>
      )}
    </Button>
  );
}