import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import JobPlanTemplate from "@/components/job-plan-template";
import type { JobPlan } from "@shared/schema";

export default function JobPlans() {
  const { data: plans, isLoading } = useQuery<JobPlan[]>({
    queryKey: ["/api/job-plans"],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Please login first');
      const res = await fetch("/api/job-plans", {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      if (!res.ok) throw new Error('Failed to fetch job plans');
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-[200px] w-full" />
        <Skeleton className="h-[200px] w-full" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">Saved Job Plans</h1>
      
      <div className="space-y-8">
        {plans?.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                Saved Job plans not available on the free version.
              </p>
            </CardContent>
          </Card>
        ) : (
          plans?.map((plan) => (
            <JobPlanTemplate key={plan.id} plan={plan} />
          ))
        )}
      </div>
    </div>
  );
}
