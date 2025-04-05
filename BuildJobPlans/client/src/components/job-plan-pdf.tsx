import type { JobPlan } from "@shared/schema";
import type { JobPlanAIResponse } from "../../../server/lib/openai";

type Plan = JobPlan | JobPlanAIResponse;

class JobPlanPDF {
  static async generate(plan: Plan) {
    // Create a new window for the printable version
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    // Generate HTML content
    const content = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${plan.planId} - Job Plan</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              margin: 40px;
            }
            h1 { margin-bottom: 20px; }
            h2 { margin-top: 20px; color: #666; }
            .section { margin-bottom: 20px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
            @media print {
              body { margin: 20px; }
            }
          </style>
        </head>
        <body>
          <h1>${plan.planId} - Maintenance Job Plan</h1>

          <div class="section">
            <h2>Equipment Details</h2>
            <div class="grid">
              <div>Name: ${plan.equipmentName}</div>
              <div>Model: ${plan.equipmentModel || "N/A"}</div>
              <div>Serial: ${plan.equipmentSerial || "N/A"}</div>
            </div>
          </div>

          <div class="section">
            <h2>Scope of Work</h2>
            <p>${plan.scopeOfWork}</p>
          </div>

          <div class="section">
            <h2>Job Steps</h2>
            ${plan.jobSteps.map((step, index) => `
              <div style="margin-bottom: 20px;">
                <h3>Step ${step.stepNumber || index + 1}</h3>
                <p>${step.description}</p>
              </div>
            `).join('')}
          </div>

          <div class="section">
            <h2>Tools & Materials</h2>
            <div class="grid">
              <div>
                <strong>Tools Required:</strong>
                <ul>
                  ${plan.toolsRequired.map((tool) => `<li>${tool}</li>`).join("")}
                </ul>
              </div>
              <div>
                <strong>Materials Required:</strong>
                <ul>
                  ${plan.materialsRequired.map((material) => `<li>${material}</li>`).join("")}
                </ul>
              </div>
            </div>
          </div>

          <div class="section">
            <h2>Manpower</h2>
            <div>Count: ${plan.manpowerCount}</div>
            <div>Skills: ${plan.skillLevels.join(", ")}</div>
            <div>Estimated Time: ${plan.estimatedTime}</div>
          </div>

          <div class="section">
            <h2>Safety Requirements</h2>
            <div>
              <strong>PPE:</strong>
              <ul>
                ${plan.safetyPpe.map((ppe) => `<li>${ppe}</li>`).join("")}
              </ul>
            </div>
            <div>
              <strong>Safety Procedures:</strong>
              <ul>
                ${plan.safetyProcedures.map((procedure) => `<li>${procedure}</li>`).join("")}
              </ul>
            </div>
            <div>
              <strong>Potential Hazards:</strong>
              <ul>
                ${plan.safetyHazards.map((hazard) => `<li>${hazard}</li>`).join("")}
              </ul>
            </div>
          </div>

          <div class="section">
            <h2>Best Practices</h2>
            <p>${plan.bestPractices}</p>
          </div>

          <div class="section">
            <h2>Recommendations</h2>
            <div>
              <strong>Manuals:</strong>
              <ul>
                ${plan.recommendations.manuals.map((manual) => `<li>${manual}</li>`).join("")}
              </ul>
            </div>
            <div>
              <strong>Procedures:</strong>
              <ul>
                ${plan.recommendations.procedures.map((procedure) => `<li>${procedure}</li>`).join("")}
              </ul>
            </div>
          </div>

          <div class="section">
            <h2>Applicable Codes & Standards</h2>
            <ul>
              ${plan.applicableCodes.map((code) => `<li>${code}</li>`).join("")}
            </ul>
          </div>

          ${
            "notes" in plan && plan.notes
              ? `
          <div class="section">
            <h2>Notes</h2>
            <p>${plan.notes}</p>
          </div>
          `
              : ""
          }
        </body>
      </html>
    `;

    // Write content to the new window
    printWindow.document.write(content);
    printWindow.document.close();

    // Wait for content to load then print
    printWindow.onload = () => {
      printWindow.print();
    };
  }
}

export default JobPlanPDF;