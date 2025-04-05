import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";

export default function PaymentSettings() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    try {
      setLoading(true);
      // Get the current hostname for proper redirects
      const hostname = window.location.origin;
      console.log('Making payment request to:', `${hostname}/api/payments/subscribe`);
      const res = await fetch(`${hostname}/api/payments/subscribe`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({}),
        credentials: 'include'
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `${res.status}: ${res.statusText}`);
      }

      let data;
      try {
        data = await res.json();
      } catch (err) {
        console.error('Response parsing error:', err);
        throw new Error('Failed to parse server response');
      }

      if (!res.ok || !data) {
        throw new Error(data?.message || `Payment request failed (${res.status})`);
      }

      if (!data.url) {
        throw new Error('Payment URL not received');
      }

      if (!res.ok) {
        const errorMessage = data?.message || 'Payment session creation failed';
        console.error('Server error:', { status: res.status, message: errorMessage });
        throw new Error(errorMessage);
      }
      
      if (!data.url) {
        throw new Error('Payment URL not received');
      }
      
      console.log('Stripe URL:', data.url);
      // Redirect to Stripe checkout
      window.location.href = data.url;
    } catch (error: any) {
      console.error('Payment initiation error:', error);
      let errorMessage = "Failed to initiate subscription. Please try again.";
      
      if (error.message?.includes('configuration')) {
        errorMessage = "Payment system configuration error. Please try again later.";
      } else if (error.message?.includes('network')) {
        errorMessage = "Network error. Please check your connection and try again.";
      }
      
      toast({
        variant: "destructive",
        title: "Payment Error",
        description: errorMessage
      });
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Premium Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Unlimited AI-generated maintenance plans
          </p>
          <Button 
            onClick={handleSubscribe}
            disabled={loading}
            className="w-full bg-customBlue text-white hover:bg-customBlue/90"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Subscribe $20/mo"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}