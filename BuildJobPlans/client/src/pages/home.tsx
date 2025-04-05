
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PaymentSettings from "@/components/payment-settings";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import JobPlanTemplate from "@/components/job-plan-template";
import { apiRequest } from "@/lib/queryClient";
import type { JobPlanAIResponse } from "../../../server/lib/openai";

export default function Home() {
  const [query, setQuery] = useState("");
  const { toast } = useToast();
  const [remainingPlans, setRemainingPlans] = useState<number>(3);

  const generateMutation = useMutation({
    mutationFn: async (query: string) => {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Please login first');
      const res = await fetch("/api/job-plans/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ query }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || error.error || "Failed to generate plan");
      }
      return res.json() as Promise<JobPlanAIResponse>;
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-center">Maintenance Plan Generator</h1>
      <div className="max-w-3xl mx-auto text-center">
        <p className="text-lg text-muted-foreground">
           Just enter the scope of work and let the AI Generator build you a custom job plan in seconds.
        </p>
      </div>

      <div className="text-center mb-6">
        <Button 
          variant="outline" 
          className="hover:bg-[rgb(0,85,255)] hover:text-white"
          onClick={() => window.open('/MJP-2025-0641 - Job Plan.pdf')}
        >
          View Sample Plan
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              generateMutation.mutate(query);
            }}
            className="flex gap-2"
          >
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Describe the maintenance task (e.g., Replace hydraulic pump on CNC lathe)"
              className="flex-1"
            />
            <Button
              type="submit"
              disabled={generateMutation.isPending}
              className="bg-[rgb(255,255,255)] hover:bg-[rgb(0,85,255)]/90"
            >
              {generateMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Plan"
              )}
            </Button>
          </form>

          {remainingPlans > 0 && (
            <p className="mt-2 text-sm text-muted-foreground text-center">
              You have {remainingPlans} free plan{remainingPlans !== 1 && "s"} remaining today
            </p>
          )}

          {generateMutation.data && (
            <div className="mt-8">
              <JobPlanTemplate plan={generateMutation.data} />
            </div>
          )}
        </CardContent>
      </Card>

      
    </div>
  );
}
