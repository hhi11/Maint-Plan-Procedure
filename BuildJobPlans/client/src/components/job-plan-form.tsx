import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus, X } from "lucide-react";
import { insertJobPlanSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { JobPlan } from "@shared/schema";
import type { JobPlanAIResponse } from "../../../server/lib/openai";

interface JobStep {
  description: string;
  cautions: string[];
  verifications: string[];
}

interface FormValues {
  planId: string;
  equipmentName: string;
  equipmentModel: string;
  equipmentSerial: string;
  scopeOfWork: string;
  jobSteps: JobStep[];
  toolsRequired: string[];
  materialsRequired: string[];
  manpowerCount: string;
  skillLevels: string[];
  estimatedTime: string;
  safetyPpe: string[];
  safetyProcedures: string[];
  safetyHazards: string[];
  bestPractices: string;
  notes: string;
}

interface JobPlanFormProps {
  plan?: JobPlan | JobPlanAIResponse;
  onSuccess?: () => void;
}

export default function JobPlanForm({ plan, onSuccess }: JobPlanFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(insertJobPlanSchema),
    defaultValues: {
      planId: plan?.planId || "",
      equipmentName: plan?.equipmentName || "",
      equipmentModel: plan?.equipmentModel || "",
      equipmentSerial: plan?.equipmentSerial || "",
      scopeOfWork: plan?.scopeOfWork || "",
      jobSteps: [],
      toolsRequired: [],
      materialsRequired: [],
      manpowerCount: "",
      skillLevels: [],
      estimatedTime: "",
      safetyPpe: [],
      safetyProcedures: [],
      safetyHazards: [],
      bestPractices: "",
      notes: "",
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const res = await apiRequest(
        plan ? "PATCH" : "POST",
        plan ? `/api/job-plans/${plan.id}` : "/api/job-plans",
        values
      );
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/job-plans"] });
      toast({ title: "Success", description: "Job plan saved successfully" });
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });

  const onSubmit = (values: FormValues) => {
    saveMutation.mutate(values);
  };

  const addArrayItem = (fieldName: keyof FormValues) => {
    const currentValues = form.getValues(fieldName) as string[];
    form.setValue(fieldName, [...currentValues, ""]);
  };

  const removeArrayItem = (fieldName: keyof FormValues, index: number) => {
    const currentValues = form.getValues(fieldName) as string[];
    form.setValue(
      fieldName,
      currentValues.filter((_, i) => i !== index)
    );
  };

  const addJobStep = () => {
    const currentSteps = form.getValues("jobSteps");
    form.setValue("jobSteps", [
      ...currentSteps,
      { description: "", cautions: [], verifications: [] },
    ]);
  };

  const removeJobStep = (index: number) => {
    const currentSteps = form.getValues("jobSteps");
    form.setValue(
      "jobSteps",
      currentSteps.filter((_, i) => i !== index)
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-4xl mx-auto p-6">
        <div className="text-2xl font-bold">
          {plan ? "Edit Job Plan" : "Create New Job Plan"}
        </div>

        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Basic Information</h3>
          
          <FormField
            control={form.control}
            name="planId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Plan ID</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="MJP-2024-001" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="equipmentName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Equipment Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Equipment name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="equipmentModel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Model</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Model number" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="equipmentSerial"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Serial Number</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Serial number" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Scope of Work */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Scope of Work</h3>
          <FormField
            control={form.control}
            name="scopeOfWork"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Describe the maintenance task"
                    className="min-h-[100px]"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Job Steps */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Job Steps</h3>
            <Button
              type="button"
              variant="outline"
              onClick={addJobStep}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Step
            </Button>
          </div>

          {form.watch("jobSteps").map((step, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Step {index + 1}</h4>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeJobStep(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <FormField
                control={form.control}
                name={`jobSteps.${index}.description`}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Describe the step"
                        className="min-h-[80px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          ))}
        </div>

        {/* Tools and Materials */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Tools and Materials</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <FormLabel>Tools Required</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addArrayItem("toolsRequired")}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Tool
                </Button>
              </div>
              
              {form.watch("toolsRequired").map((tool, index) => (
                <div key={index} className="flex gap-2">
                  <FormField
                    control={form.control}
                    name={`toolsRequired.${index}`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input {...field} placeholder="Enter tool name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeArrayItem("toolsRequired", index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <FormLabel>Materials Required</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addArrayItem("materialsRequired")}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Material
                </Button>
              </div>
              
              {form.watch("materialsRequired").map((material, index) => (
                <div key={index} className="flex gap-2">
                  <FormField
                    control={form.control}
                    name={`materialsRequired.${index}`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input {...field} placeholder="Enter material name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeArrayItem("materialsRequired", index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Safety Requirements */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Safety Requirements</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <FormLabel>PPE Required</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addArrayItem("safetyPpe")}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add PPE
                </Button>
              </div>
              
              {form.watch("safetyPpe").map((ppe, index) => (
                <div key={index} className="flex gap-2">
                  <FormField
                    control={form.control}
                    name={`safetyPpe.${index}`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input {...field} placeholder="Enter PPE requirement" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeArrayItem("safetyPpe", index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <FormLabel>Safety Procedures</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addArrayItem("safetyProcedures")}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Procedure
                </Button>
              </div>
              
              {form.watch("safetyProcedures").map((procedure, index) => (
                <div key={index} className="flex gap-2">
                  <FormField
                    control={form.control}
                    name={`safetyProcedures.${index}`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input {...field} placeholder="Enter safety procedure" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeArrayItem("safetyProcedures", index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Additional Notes</h3>
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Any additional notes or comments"
                    className="min-h-[100px]"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-6">
          <Button
            type="submit"
            disabled={saveMutation.isPending}
          >
            {saveMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Job Plan"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
} 