
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function FAQ() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-4xl font-bold mb-8">Frequently Asked Questions</h1>
      
      <Accordion type="single" collapsible className="space-y-4">
        <AccordionItem value="item-1">
          <AccordionTrigger>How do I create a new job plan?</AccordionTrigger>
          <AccordionContent>
            To create a new job plan, navigate to the Job Plans page and click the "Create New Plan" button. Fill in the required fields including equipment details, scope of work, and safety requirements. You can use our AI-powered assistant to help generate comprehensive plans by describing the maintenance task in natural language.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-2">
          <AccordionTrigger>Can I edit an existing job plan?</AccordionTrigger>
          <AccordionContent>
            Yes, you can edit any existing job plan. Go to the Job Plans page, find the plan you want to modify, and click the "Edit" button. You can update any field including equipment details, safety requirements, and work steps. All changes are automatically saved when you submit the form.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-3">
          <AccordionTrigger>How does the AI assistance work?</AccordionTrigger>
          <AccordionContent>
            Our AI assistant helps create detailed job plans based on your description. Simply describe the maintenance task, and the AI will generate a comprehensive plan including safety requirements, tools needed, and step-by-step instructions. You can then review and modify the generated plan before finalizing it.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-4">
          <AccordionTrigger>How do I manage safety requirements in a job plan?</AccordionTrigger>
          <AccordionContent>
            Each job plan includes a dedicated safety section where you can specify required PPE, potential hazards, and safety procedures. Click the "Safety Requirements" section when editing a plan to add or modify these details. The AI assistant can also help suggest appropriate safety measures based on the type of work being performed.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-5">
          <AccordionTrigger>Can I share job plans with my team?</AccordionTrigger>
          <AccordionContent>
            Yes, all job plans are accessible to authorized team members. Once you create or update a plan, it becomes available to everyone with access to the system. You can view all plans from the Job Plans page, and use the search function to find specific plans quickly.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-6">
          <AccordionTrigger>How do I organize and find specific job plans?</AccordionTrigger>
          <AccordionContent>
            The Job Plans page includes search and filter functionality to help you find specific plans. You can search by equipment name, type of maintenance, or keywords in the scope of work. Plans are also organized by date and equipment type for easy navigation.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
