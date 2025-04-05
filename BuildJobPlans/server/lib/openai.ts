import OpenAI from "openai";
import { z } from "zod";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

if (!process.env.OPENAI_API_KEY) {
  console.warn('Warning: OPENAI_API_KEY environment variable is not set');
}

export type JobPlanAIResponse = {
  planId: string;
  equipmentName: string;
  equipmentModel: string;
  equipmentSerial: string;
  scopeOfWork: string;
  jobSteps: { stepNumber: number; description: string }[];
  toolsRequired: string[];
  materialsRequired: string[];
  manpowerCount: string;
  skillLevels: string[];
  estimatedTime: string;
  safetyPpe: string[];
  safetyProcedures: string[];
  safetyHazards: string[];
  bestPractices: string;
  recommendations: {
    manuals: string[];
    procedures: string[];
  };
  applicableCodes: string[];
  notes: string;
};

export async function generateJobPlan(query: string): Promise<JobPlanAIResponse> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OpenAI API key is not configured");
    }

    const planId = `MJP-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are an expert industrial maintenance planner. Respond ONLY with a valid JSON object containing these fields:
{
  "equipmentName": "string",
  "equipmentModel": "string",
  "equipmentSerial": "string",
  "scopeOfWork": "string",
  "jobSteps": [{"stepNumber": number, "description": "string"}],
  "toolsRequired": ["string"],
  "materialsRequired": ["string"],
  "manpowerCount": "string",
  "skillLevels": ["string"],
  "estimatedTime": "string",
  "safetyPpe": ["string"],
  "safetyProcedures": ["string"],
  "safetyHazards": ["string"],
  "bestPractices": "string",
  "recommendations": {"manuals": ["string"], "procedures": ["string"]},
  "applicableCodes": ["string"],
  "notes": "string"
}`
        },
        {
          role: "user",
          content: `Generate a maintenance job plan for: ${query}. Respond ONLY with the JSON object.`
        }
      ],
      temperature: 0.7,
    });

    if (!completion.choices[0]?.message?.content) {
      throw new Error("No response from OpenAI");
    }

    // Parse the response into structured data
    const response = JSON.parse(completion.choices[0].message.content);

    // Ensure the response matches our expected schema
    const defaultedResult = {
      equipmentName: response.equipmentName || "",
      equipmentModel: response.equipmentModel || "",
      equipmentSerial: response.equipmentSerial || "",
      scopeOfWork: response.scopeOfWork || query,
      jobSteps: response.jobSteps || [],
      toolsRequired: response.toolsRequired || [],
      materialsRequired: response.materialsRequired || [],
      manpowerCount: response.manpowerCount || "",
      skillLevels: response.skillLevels || [],
      estimatedTime: response.estimatedTime || "",
      safetyPpe: response.safetyPpe || [],
      safetyProcedures: response.safetyProcedures || [],
      safetyHazards: response.safetyHazards || [],
      bestPractices: response.bestPractices || "",
      recommendations: response.recommendations || { manuals: [], procedures: [] },
      applicableCodes: response.applicableCodes || [],
      notes: response.notes || "",
    };

    return {
      planId,
      ...defaultedResult
    };
  } catch (error: any) {
    console.error("OpenAI API Error:", error);
    throw new Error(`Failed to generate job plan: ${error.message}`);
  }
}