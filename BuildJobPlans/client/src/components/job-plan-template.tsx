import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Save, Trash2, FileDown, Plus, X } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { JobPlan } from "@shared/schema";
import type { JobPlanAIResponse } from "../../../server/lib/openai";
import JobPlanPDF from "./job-plan-pdf";

interface Craftsman {
  type: string;
  count: number;
}

interface JobStep {
  stepNumber: number;
  description: string;
}

type Plan = JobPlan | JobPlanAIResponse;

export default function JobPlanTemplate({ plan }: { plan: Plan }) {
  const [isEditing, setIsEditing] = useState(true); // Default to editing mode
  const [editedPlan, setEditedPlan] = useState<Plan>(plan);
  const { toast } = useToast();

  // Helper function to add items to arrays
  const addArrayItem = (field: keyof Plan, defaultValue: any = "") => {
    if (Array.isArray(editedPlan[field])) {
      setEditedPlan({
        ...editedPlan,
        [field]: [...(editedPlan[field] as any[]), defaultValue],
      });
    }
  };

  // Helper function to remove items from arrays
  const removeArrayItem = (field: keyof Plan, index: number) => {
    if (Array.isArray(editedPlan[field])) {
      setEditedPlan({
        ...editedPlan,
        [field]: (editedPlan[field] as any[]).filter((_, i) => i !== index),
      });
    }
  };

  // Helper function to add a new job step
  const addJobStep = () => {
    const newStep: JobStep = {
      stepNumber: editedPlan.jobSteps.length + 1,
      description: "",
    };
    setEditedPlan({
      ...editedPlan,
      jobSteps: [...editedPlan.jobSteps, newStep],
    });
  };

  // Helper function to remove a job step
  const removeJobStep = (index: number) => {
    setEditedPlan({
      ...editedPlan,
      jobSteps: editedPlan.jobSteps.filter((_, i) => i !== index),
    });
  };

  // Helper function to add recommendation items
  const addRecommendationItem = (field: 'manuals' | 'procedures') => {
    setEditedPlan({
      ...editedPlan,
      recommendations: {
        ...editedPlan.recommendations,
        [field]: [...editedPlan.recommendations[field], ""],
      },
    });
  };

  // Helper function to remove recommendation items
  const removeRecommendationItem = (field: 'manuals' | 'procedures', index: number) => {
    setEditedPlan({
      ...editedPlan,
      recommendations: {
        ...editedPlan.recommendations,
        [field]: editedPlan.recommendations[field].filter((_, i) => i !== index),
      },
    });
  };

  const saveMutation = useMutation({
    mutationFn: async (plan: Plan) => {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Please login first');
      const res = await fetch("id" in plan ? `/api/job-plans/${plan.id}` : "/api/job-plans", {
        method: "id" in plan ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(plan)
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to save plan");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/job-plans"] });
      toast({ title: "Success", description: "Job plan saved successfully" });
      setIsEditing(false);
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/job-plans/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/job-plans"] });
      toast({ title: "Success", description: "Job plan deleted successfully" });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-2xl">
          {plan.planId}{" "}
          <Badge variant="outline" className="ml-2">
            {"status" in plan ? plan.status : "draft"}
          </Badge>
        </CardTitle>
        <div className="flex gap-2">
          {"id" in plan && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => deleteMutation.mutate(plan.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => JobPlanPDF.generate(plan)}
          >
            <FileDown className="h-4 w-4" />
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => saveMutation.mutate(editedPlan)}
          >
            <Save className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" defaultValue={["equipment", "scope", "steps", "tools", "manpower", "safety", "practices", "codes"]}>
          <AccordionItem value="equipment">
            <AccordionTrigger>Equipment Details</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <Input
                  value={editedPlan.equipmentName}
                  onChange={(e) =>
                    setEditedPlan({
                      ...editedPlan,
                      equipmentName: e.target.value,
                    })
                  }
                  placeholder="Equipment Name"
                />
                <Input
                  value={editedPlan.equipmentModel}
                  onChange={(e) =>
                    setEditedPlan({
                      ...editedPlan,
                      equipmentModel: e.target.value,
                    })
                  }
                  placeholder="Model"
                />
                <Input
                  value={editedPlan.equipmentSerial}
                  onChange={(e) =>
                    setEditedPlan({
                      ...editedPlan,
                      equipmentSerial: e.target.value,
                    })
                  }
                  placeholder="Serial Number"
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="scope">
            <AccordionTrigger>Scope of Work</AccordionTrigger>
            <AccordionContent>
              <Textarea
                value={editedPlan.scopeOfWork}
                onChange={(e) =>
                  setEditedPlan({
                    ...editedPlan,
                    scopeOfWork: e.target.value,
                  })
                }
                className="min-h-[100px]"
              />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="steps">
            <AccordionTrigger className="flex justify-between">
              Job Steps
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  addJobStep();
                }}
                className="mr-4"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Step
              </Button>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                {editedPlan.jobSteps.map((step: JobStep, index: number) => (
                  <div key={index} className="border rounded-lg p-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">Step {step.stepNumber || index + 1}</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeJobStep(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <Textarea
                      value={step.description}
                      onChange={(e) => {
                        const newSteps = [...editedPlan.jobSteps];
                        newSteps[index] = { ...step, description: e.target.value };
                        setEditedPlan({ ...editedPlan, jobSteps: newSteps });
                      }}
                      className="min-h-[80px]"
                    />
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="tools">
            <AccordionTrigger>Tools & Materials</AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">Tools Required</h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addArrayItem('toolsRequired')}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Tool
                    </Button>
                  </div>
                  {editedPlan.toolsRequired.map((tool: string, index: number) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={tool}
                        onChange={(e) => {
                          const newTools = [...editedPlan.toolsRequired];
                          newTools[index] = e.target.value;
                          setEditedPlan({ ...editedPlan, toolsRequired: newTools });
                        }}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeArrayItem('toolsRequired', index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">Materials Required</h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addArrayItem('materialsRequired')}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Material
                    </Button>
                  </div>
                  {editedPlan.materialsRequired.map((material: string, index: number) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={material}
                        onChange={(e) => {
                          const newMaterials = [...editedPlan.materialsRequired];
                          newMaterials[index] = e.target.value;
                          setEditedPlan({ ...editedPlan, materialsRequired: newMaterials });
                        }}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeArrayItem('materialsRequired', index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="manpower">
            <AccordionTrigger>Manpower Requirements</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Required Personnel:</h4>
                  <Input
                    value={editedPlan.manpowerCount}
                    onChange={(e) =>
                      setEditedPlan({
                        ...editedPlan,
                        manpowerCount: e.target.value,
                      })
                    }
                    placeholder="Number of personnel needed"
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">Required Skills</h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addArrayItem('skillLevels')}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Skill
                    </Button>
                  </div>
                  {editedPlan.skillLevels.map((skill: string, index: number) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <Input
                        value={skill}
                        onChange={(e) => {
                          const newSkills = [...editedPlan.skillLevels];
                          newSkills[index] = e.target.value;
                          setEditedPlan({ ...editedPlan, skillLevels: newSkills });
                        }}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeArrayItem('skillLevels', index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div>
                  <h4 className="font-medium mb-2">Estimated Time:</h4>
                  <Input
                    value={editedPlan.estimatedTime}
                    onChange={(e) =>
                      setEditedPlan({
                        ...editedPlan,
                        estimatedTime: e.target.value,
                      })
                    }
                    placeholder="Estimated duration"
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="safety">
            <AccordionTrigger>Safety Requirements</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">PPE Required</h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addArrayItem('safetyPpe')}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add PPE
                    </Button>
                  </div>
                  {editedPlan.safetyPpe.map((ppe: string, index: number) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={ppe}
                        onChange={(e) => {
                          const newPpe = [...editedPlan.safetyPpe];
                          newPpe[index] = e.target.value;
                          setEditedPlan({ ...editedPlan, safetyPpe: newPpe });
                        }}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeArrayItem('safetyPpe', index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">Safety Procedures</h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addArrayItem('safetyProcedures')}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Procedure
                    </Button>
                  </div>
                  {editedPlan.safetyProcedures.map((procedure: string, index: number) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={procedure}
                        onChange={(e) => {
                          const newProcedures = [...editedPlan.safetyProcedures];
                          newProcedures[index] = e.target.value;
                          setEditedPlan({ ...editedPlan, safetyProcedures: newProcedures });
                        }}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeArrayItem('safetyProcedures', index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">Potential Hazards</h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addArrayItem('safetyHazards')}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Hazard
                    </Button>
                  </div>
                  {editedPlan.safetyHazards.map((hazard: string, index: number) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={hazard}
                        onChange={(e) => {
                          const newHazards = [...editedPlan.safetyHazards];
                          newHazards[index] = e.target.value;
                          setEditedPlan({ ...editedPlan, safetyHazards: newHazards });
                        }}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeArrayItem('safetyHazards', index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="practices">
            <AccordionTrigger>Best Practices & Recommendations</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium mb-2">Best Practices:</h4>
                  <Textarea
                    value={editedPlan.bestPractices}
                    onChange={(e) =>
                      setEditedPlan({
                        ...editedPlan,
                        bestPractices: e.target.value,
                      })
                    }
                    className="min-h-[100px]"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">Recommended Manuals</h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addRecommendationItem('manuals')}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Manual
                    </Button>
                  </div>
                  {editedPlan.recommendations.manuals.map((manual: string, index: number) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={manual}
                        onChange={(e) => {
                          const newManuals = [...editedPlan.recommendations.manuals];
                          newManuals[index] = e.target.value;
                          setEditedPlan({
                            ...editedPlan,
                            recommendations: {
                              ...editedPlan.recommendations,
                              manuals: newManuals,
                            },
                          });
                        }}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeRecommendationItem('manuals', index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">Recommended Procedures</h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addRecommendationItem('procedures')}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Procedure
                    </Button>
                  </div>
                  {editedPlan.recommendations.procedures.map((procedure: string, index: number) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={procedure}
                        onChange={(e) => {
                          const newProcedures = [...editedPlan.recommendations.procedures];
                          newProcedures[index] = e.target.value;
                          setEditedPlan({
                            ...editedPlan,
                            recommendations: {
                              ...editedPlan.recommendations,
                              procedures: newProcedures,
                            },
                          });
                        }}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeRecommendationItem('procedures', index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="codes">
            <AccordionTrigger>
              <div className="flex justify-between items-center w-full pr-4">
                <span>Applicable Codes & Standards</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    addArrayItem('applicableCodes');
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Code
                </Button>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                {editedPlan.applicableCodes.map((code: string, index: number) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={code}
                      onChange={(e) => {
                        const newCodes = [...editedPlan.applicableCodes];
                        newCodes[index] = e.target.value;
                        setEditedPlan({ ...editedPlan, applicableCodes: newCodes });
                      }}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeArrayItem('applicableCodes', index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}