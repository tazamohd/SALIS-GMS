import OpenAI from "openai";
import type { IStorage } from "../storage";
import type { JobCard, User, TechnicianProfile } from "@shared/schema";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  // Placeholder keeps the SDK from throwing at import when the integration is
  // unconfigured; call sites guard on the env var before using the client.
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY || "not-configured"
});

interface TechnicianRecommendation {
  technicianId: string;
  technicianName: string;
  confidence: number; // 0-100
  rationale: string;
  matchedSkills: string[];
  estimatedWorkload: string;
  availability: string;
}

interface AssignmentContext {
  jobCard: JobCard;
  availableTechnicians: Array<{
    technician: User & { profile: TechnicianProfile };
    activeJobCount: number;
  }>;
  assignmentRules: any[];
}

export async function getAIAssignmentRecommendations(
  storage: IStorage,
  garageId: string,
  jobCardId: string
): Promise<any[]> {
  const startTime = Date.now();

  const context = await buildAssignmentContext(storage, garageId, jobCardId);
  if (!context) {
    throw new Error("Job card not found or no available technicians");
  }

  const recommendations = await callOpenAIForRecommendations(context);

  const persisted = await persistRecommendations(storage, garageId, jobCardId, recommendations, context.availableTechnicians, Date.now() - startTime);

  return persisted.slice(0, 3).map(p => ({
    id: p.id,
    technicianId: p.recommendedTechnicianId,
    technicianName: (p.technicianContext as any)?.technicianName || 'Unknown',
    confidence: parseFloat(p.confidenceScore),
    rationale: (p.reasoning as any)?.rationale || '',
    matchedSkills: (p.reasoning as any)?.matchedSkills || [],
    estimatedWorkload: (p.reasoning as any)?.estimatedWorkload || 'medium',
    availability: (p.reasoning as any)?.availability || 'unknown'
  }));
}

async function buildAssignmentContext(
  storage: IStorage,
  garageId: string,
  jobCardId: string
): Promise<AssignmentContext | null> {
  const jobCardContext = await storage.getJobCardWithContext(jobCardId, garageId);
  if (!jobCardContext) return null;

  const availableTechnicians = await storage.getTechniciansWithLoad(garageId);
  if (availableTechnicians.length === 0) return null;

  const assignmentRules = await storage.listAssignmentRules(garageId, true);

  return {
    jobCard: jobCardContext.jobCard,
    availableTechnicians,
    assignmentRules
  };
}

async function callOpenAIForRecommendations(
  context: AssignmentContext
): Promise<TechnicianRecommendation[]> {
  const { jobCard, availableTechnicians, assignmentRules } = context;

  const systemPrompt = `You are an expert automotive technician assignment system for a garage. Your task is to recommend the best technicians for a given job based on skills, workload, experience, and assignment rules.

Assignment Rules:
${JSON.stringify(assignmentRules, null, 2)}

Consider these factors:
1. Technician skills match with job requirements
2. Current workload (active jobs vs max capacity)
3. Experience level appropriate for job priority/complexity
4. Hourly rate vs job budget
5. Assignment rules (if any)

Return the top 3 technician recommendations with confidence scores and detailed rationale.`;

  const userPrompt = `Job Details:
- Service Type: ${jobCard.serviceType}
- Description: ${jobCard.description}
- Priority: ${jobCard.priority}
- Estimated Hours: ${jobCard.estimatedHours || 'Not specified'}

Available Technicians:
${availableTechnicians.map((t, i) => `
${i + 1}. ${t.technician.fullName || 'Unknown'} (ID: ${t.technician.id})
   - Skills: ${t.technician.profile.skills || 'None specified'}
   - Level: ${t.technician.profile.level}
   - Experience: ${t.technician.profile.yearsOfExperience || 0} years
   - Hourly Rate: $${t.technician.profile.hourlyRate || 0}
   - Active Jobs: ${t.activeJobCount} / ${t.technician.profile.maxConcurrentJobs || 3}
   - Certifications: ${t.technician.profile.certifications || 'None'}
`).join('\n')}

Return recommendations as JSON array with this schema:
{
  "recommendations": [
    {
      "technicianId": "string",
      "technicianName": "string",
      "confidence": number (0-100),
      "rationale": "detailed explanation",
      "matchedSkills": ["skill1", "skill2"],
      "estimatedWorkload": "low|medium|high",
      "availability": "immediate|within_day|scheduled"
    }
  ]
}`;

  const response = await openai.chat.completions.create({
    model: "gpt-5", // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ],
    response_format: { type: "json_object" },
    max_completion_tokens: 8192,
  });

  const content = response.choices[0]?.message?.content || "{}";
  const parsed = JSON.parse(content);

  return parsed.recommendations || [];
}

async function persistRecommendations(
  storage: IStorage,
  garageId: string,
  jobCardId: string,
  recommendations: TechnicianRecommendation[],
  availableTechnicians: Array<{ technician: User & { profile: TechnicianProfile }; activeJobCount: number }>,
  processingTimeMs: number
): Promise<any[]> {
  const jobCardContext = await storage.getJobCardWithContext(jobCardId, garageId);
  if (!jobCardContext) return [];

  const technicianMap = new Map(
    availableTechnicians.map(t => [t.technician.id, t])
  );

  const aiRecommendations = recommendations.map(rec => {
    const techData = technicianMap.get(rec.technicianId);
    const technicianName = techData?.technician.fullName || rec.technicianName || 'Unknown';
    const technicianEmail = techData?.technician.email || '';
    const technicianLevel = techData?.technician.profile.level || '';
    
    return {
      jobCardId,
      garageId,
      recommendedTechnicianId: rec.technicianId,
      confidenceScore: rec.confidence.toString(),
      reasoning: {
        rationale: rec.rationale,
        matchedSkills: rec.matchedSkills,
        estimatedWorkload: rec.estimatedWorkload,
        availability: rec.availability
      },
      jobContext: {
        serviceType: jobCardContext.jobCard.serviceType,
        description: jobCardContext.jobCard.description,
        priority: jobCardContext.jobCard.priority,
        estimatedHours: jobCardContext.jobCard.estimatedHours
      },
      technicianContext: {
        technicianId: rec.technicianId,
        technicianName,
        technicianEmail,
        technicianLevel,
        activeJobCount: techData?.activeJobCount || 0
      },
      modelUsed: "gpt-5",
      wasAccepted: false,
      processingTimeMs
    };
  });

  return await storage.saveAIRecommendations(aiRecommendations);
}
